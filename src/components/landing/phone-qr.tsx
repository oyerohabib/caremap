"use client";

import { QRCodeSVG } from "qrcode.react";
import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

export function PhoneQr() {
  const origin = useSyncExternalStore(
    subscribe,
    () => window.location.origin,
    () => null,
  );

  return (
    <div className="flex items-center gap-4 rounded-2xl border bg-card p-4">
      <div className="grid size-24 shrink-0 place-items-center rounded-lg bg-white p-1.5">
        {origin ? (
          <QRCodeSVG value={origin} size={84} marginSize={0} title="QR code linking to this demo" />
        ) : null}
      </div>
      <div className="text-sm">
        <p className="font-medium">Best on a phone</p>
        <p className="text-muted-foreground">Scan to open this demo and try tapping the body map.</p>
      </div>
    </div>
  );
}
