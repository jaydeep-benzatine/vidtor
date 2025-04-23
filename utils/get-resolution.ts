import { toast } from "sonner";

export function getVideoResolution(file: File) {
  if (!file) {
    toast('File is required' );
    return
  }

  const fileURL = URL.createObjectURL(file);
}