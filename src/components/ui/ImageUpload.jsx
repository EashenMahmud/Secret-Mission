import React, { useRef, useState, useEffect } from 'react';
import { useField } from 'formik';
import { cn, getImageUrl } from '../../lib/utils';
import { X, ImageIcon } from 'lucide-react';

const ImageUpload = ({ label, helperText, className, required, ...props }) => {
    const [field, meta, helpers] = useField(props);
    const [preview, setPreview] = useState(null);
    const fileInputRef = useRef(null);
    const isError = meta.touched && meta.error;

    useEffect(() => {
        if (field.value) {
            if (typeof field.value === 'string') {
                setPreview(getImageUrl(field.value));
            } else if (field.value instanceof File) {
                const objectUrl = URL.createObjectURL(field.value);
                setPreview(objectUrl);
                return () => URL.revokeObjectURL(objectUrl);
            }
        } else {
            setPreview(null);
        }
    }, [field.value]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            helpers.setValue(file);
        }
    };

    const removeImage = (e) => {
        e.stopPropagation();
        helpers.setValue(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className={cn('flex flex-col gap-1 w-full', className)}>
            {label && (
                <label className="block text-sm font-medium leading-6 text-gray-900">
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}
            <div
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                    'relative flex flex-col items-center justify-center w-full min-h-[150px] border-2 border-dashed rounded-lg cursor-pointer transition-all hover:bg-gray-50 overflow-hidden',
                    isError ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'
                )}
            >
                <input
                    {...props}
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                />

                {preview ? (
                    <div className="relative w-full h-full group">
                        <img src={preview} alt="Preview" className="w-full h-[150px] object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="text-white text-sm font-medium">Change Image</span>
                        </div>
                        <button
                            type="button"
                            onClick={removeImage}
                            className="absolute top-2 right-2 p-1.5 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors z-10"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col items-center py-6">
                        <ImageIcon className="h-10 w-10 text-gray-400 mb-2" />
                        <p className="text-sm text-gray-600 px-4 text-center">
                            <span className="font-semibold text-indigo-600">Click to upload image</span>
                        </p>
                        {helperText && <p className="text-xs text-gray-500 mt-1">{helperText}</p>}
                    </div>
                )}
            </div>
            {isError && (
                <p className="mt-1 text-xs text-red-600">{meta.error}</p>
            )}
        </div>
    );
};

export default ImageUpload;
