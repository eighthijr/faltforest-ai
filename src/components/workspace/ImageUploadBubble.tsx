'use client';

import { Bot, ImagePlus } from 'lucide-react';
import { FilePond, registerPlugin } from 'react-filepond';
import FilePondPluginFileValidateSize from 'filepond-plugin-file-validate-size';
import FilePondPluginFileValidateType from 'filepond-plugin-file-validate-type';

registerPlugin(FilePondPluginFileValidateSize, FilePondPluginFileValidateType);

type ImageUploadBubbleProps = {
  files: File[];
  disabled?: boolean;
  maxFiles?: number;
  maxFileSize?: string;
  onFilesChange: (files: File[]) => void;
};

export function ImageUploadBubble({
  files,
  disabled = false,
  maxFiles = 3,
  maxFileSize = '500KB',
  onFilesChange,
}: ImageUploadBubbleProps) {
  return (
    <article className="flex w-full justify-start gap-2">
      <span className="mt-1 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-indigo-600 shadow-[0_2px_8px_rgba(15,23,42,0.15)]">
        <Bot className="h-4 w-4" />
      </span>
      <div className="w-full max-w-[80%] rounded-2xl bg-white px-4 py-3 text-sm text-slate-800 shadow-[0_2px_8px_rgba(15,23,42,0.12)]">
        <p className="inline-flex items-center gap-2 font-semibold text-slate-700">
          <ImagePlus className="h-4 w-4 text-indigo-600" />
          Upload gambar produk/testimoni
        </p>
        <p className="mt-1 text-xs text-slate-500">
          Maksimal {maxFiles} gambar. Ukuran maksimal {maxFileSize} per file. Format: JPG, PNG, WEBP.
        </p>
        <div className="mt-3">
          <FilePond
            files={files}
            onupdatefiles={(items: Array<{ file: File }>) => onFilesChange(items.map((item: { file: File }) => item.file))}
            allowMultiple
            maxFiles={maxFiles}
            allowFileTypeValidation
            acceptedFileTypes={['image/png', 'image/jpeg', 'image/webp']}
            allowFileSizeValidation
            maxFileSize={maxFileSize}
            allowReorder
            disabled={disabled}
            name="images"
            labelIdle='Drag & drop gambar atau <span class="filepond--label-action">Browse</span>'
          />
        </div>
      </div>
    </article>
  );
}
