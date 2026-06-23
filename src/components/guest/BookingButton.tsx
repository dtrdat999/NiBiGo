"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { BookingForm } from "@/components/guest/BookingForm";

export function BookingButton({ tourPackageId }: { tourPackageId: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button className="w-full" size="lg" onClick={() => setOpen(true)}>
        Chọn gói &amp; gửi yêu cầu
      </Button>
      <Modal open={open} onClose={() => setOpen(false)} title="Gửi yêu cầu đặt tour">
        <BookingForm tourPackageId={tourPackageId} onCancel={() => setOpen(false)} />
      </Modal>
    </>
  );
}
