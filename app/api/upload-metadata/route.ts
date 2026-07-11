import { NextResponse } from 'next/server';

export const maxDuration = 30;

// ── Types ─────────────────────────────────────────────────────────────────────

interface MetaplexMetadata {
  name: string;
  symbol: string;
  description: string;
  image: string;
  external_url: string;
  attributes: [];
  properties: {
    files: { uri: string; type: string }[];
    category: string;
    creators: { address: string; share: number }[];
  };
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function getImageMimeType(file: File): string {
  if (file.type) return file.type;
  const ext = file.name.split('.').pop()?.toLowerCase();
  const map: Record<string, string> = {
    png: 'image/png',
    svg: 'image/svg+xml',
    gif: 'image/gif',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    webp: 'image/webp',
  };
  return map[ext ?? ''] ?? 'image/png';
}

async function fileToBase64(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const bytes = Buffer.from(arrayBuffer);
  return `data:${getImageMimeType(file)};base64,${bytes.toString('base64')}`;
}

// ── Pinata upload helpers ─────────────────────────────────────────────────────

async function pinImageToPinata(file: File, jwt: string): Promise<string> {
  const fd = new FormData();
  fd.append('file', file);
  const res = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
    method: 'POST',
    headers: { Authorization: `Bearer ${jwt}` },
    body: fd,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Pinata image upload failed (${res.status}): ${text}`);
  }

  const { IpfsHash: imageHash } = (await res.json()) as { IpfsHash: string };
  return `https://ipfs.io/ipfs/${imageHash}`;
}

async function pinMetadataToPinata(
  metadata: MetaplexMetadata,
  ticker: string,
  jwt: string,
): Promise<string> {
  const res = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${jwt}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      pinataContent: metadata,
      pinataMetadata: { name: `${ticker}-metadata` },
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Pinata metadata upload failed (${res.status}): ${text}`);
  }

  const { IpfsHash: metaHash } = (await res.json()) as { IpfsHash: string };
  return `https://ipfs.io/ipfs/${metaHash}`;
}

// ── Route handler ─────────────────────────────────────────────────────────────

export async function POST(req: Request) {
  try {
    const data = await req.formData();

    // ── Validate required fields ──────────────────────────────────────────────
    const name = (data.get('name') as string | null)?.trim();
    const ticker = (data.get('ticker') as string | null)?.trim();

    if (!name || !ticker) {
      return NextResponse.json(
        { error: '`name` and `ticker` are required' },
        { status: 400 },
      );
    }

    const description = ((data.get('description') as string | null) ?? '').trim();
    const website     = ((data.get('website') as string | null) ?? '').trim();
    const twitter     = ((data.get('twitter') as string | null) ?? '').trim();
    const telegram    = ((data.get('telegram') as string | null) ?? '').trim();
    const creatorAddress = ((data.get('creatorAddress') as string | null) ?? '').trim();
    const imageFile   = data.get('image') as File | null;

    // ── Validate image size (max 5 MB) ────────────────────────────────────────
    if (imageFile && imageFile.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Image exceeds maximum 5 MB limit' },
        { status: 400 },
      );
    }

    const pinataJwt = process.env.PINATA_JWT;

    // ── Branch: Pinata path ───────────────────────────────────────────────────
    if (pinataJwt) {
      // Upload image first (if provided), fallback to a placeholder
      let imageUri = `https://placehold.co/400x400/0a0805/e8b84b?text=${encodeURIComponent(ticker)}`;
      let imageMime = 'image/png';

      if (imageFile) {
        imageMime = getImageMimeType(imageFile);
        imageUri = await pinImageToPinata(imageFile, pinataJwt);
      }

      const metadata: MetaplexMetadata = {
        name,
        symbol: ticker,
        description,
        image: imageUri,
        external_url: website || '',
        attributes: [],
        properties: {
          files: [{ uri: imageUri, type: imageMime }],
          category: 'image',
          creators: creatorAddress
            ? [{ address: creatorAddress, share: 100 }]
            : [],
        },
      };

      const metadataUri = await pinMetadataToPinata(metadata, ticker, pinataJwt);

      return NextResponse.json({ metadataUri, imageUri, pinned: true });
    }

    // ── Branch: Mock / dev fallback (no Pinata key) ───────────────────────────
    let imageUri: string;

    if (imageFile) {
      imageUri = await fileToBase64(imageFile);
    } else {
      imageUri = `https://placehold.co/400x400/0a0805/e8b84b?text=${encodeURIComponent(ticker)}`;
    }

    const mockMetadata: MetaplexMetadata = {
      name,
      symbol: ticker,
      description,
      image: imageUri,
      external_url: website || '',
      attributes: [],
      properties: {
        files: [{ uri: imageUri, type: imageFile ? getImageMimeType(imageFile) : 'image/png' }],
        category: 'image',
        creators: creatorAddress
          ? [{ address: creatorAddress, share: 100 }]
          : [],
      },
    };

    // Encode the metadata JSON as a data URI so the caller has a usable URI
    const metadataJson = JSON.stringify(mockMetadata);
    const metadataUri  = `data:application/json;base64,${Buffer.from(metadataJson).toString('base64')}`;

    // Stash optional social links in the response for convenience
    void twitter;
    void telegram;

    return NextResponse.json({ metadataUri, imageUri, pinned: false });
  } catch (error) {
    console.error('[upload-metadata] Unhandled error:', error);
    return NextResponse.json(
      { error: 'Metadata upload failed' },
      { status: 500 },
    );
  }
}
