import { useState, useEffect, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { X, Upload, FileText, Image as ImageIcon } from 'lucide-react';

export const DOCUMENT_TYPES = [
    { value: 'id_card_front', label: 'Občanský průkaz (Přední)' },
    { value: 'id_card_back', label: 'Občanský průkaz (Zadní)' },
    { value: 'passport', label: 'Cestovní pas' },
    { value: 'visa', label: 'Vízum' },
    { value: 'other', label: 'Jiný dokument' }
];

export default function DocumentUploader({ files, onFilesChange }) {

    // onDrop handler
    const onDrop = useCallback(acceptedFiles => {
        // Map new files to our structure: { file, type, preview, id }
        const newFiles = acceptedFiles.map(file => ({
            file,
            type: 'other', // Default type
            preview: URL.createObjectURL(file),
            id: Math.random().toString(36).substring(7)
        }));

        onFilesChange([...files, ...newFiles]);
    }, [files, onFilesChange]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/*': [],
            'application/pdf': []
        }
    });

    const handleRemove = (id) => {
        const updated = files.filter(f => f.id !== id);
        onFilesChange(updated);
    };

    const handleTypeChange = (id, newType) => {
        const updated = files.map(f => {
            if (f.id === id) return { ...f, type: newType };
            return f;
        });
        onFilesChange(updated);
    };

    // Cleanup previews
    useEffect(() => {
        return () => files.forEach(file => URL.revokeObjectURL(file.preview));
    }, []);

    return (
        <div className="document-uploader">
            {/* Dropzone */}
            <div
                {...getRootProps()}
                className={`dropzone ${isDragActive ? 'active' : ''}`}
                style={{
                    border: '2px dashed var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    padding: 'var(--space-xl)',
                    textAlign: 'center',
                    cursor: 'pointer',
                    background: isDragActive ? 'var(--color-primary-50)' : 'var(--color-surface)',
                    transition: 'all 0.2s ease',
                    marginBottom: 'var(--space-lg)'
                }}
            >
                <input {...getInputProps()} />
                <Upload size={32} style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-sm)' }} />
                {isDragActive ? (
                    <p>Sem přetáhněte soubory...</p>
                ) : (
                    <div>
                        <p style={{ fontWeight: 500 }}>Přetáhněte sem soubory nebo klikněte pro výběr</p>
                        <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>Podporujeme obrázky a PDF</p>
                    </div>
                )}
            </div>

            {/* File List */}
            {files.length > 0 && (
                <div className="file-list" style={{ display: 'grid', gap: 'var(--space-md)' }}>
                    {files.map(item => (
                        <div key={item.id} className="file-item" style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 'var(--space-md)',
                            background: 'var(--color-surface-sunken)',
                            padding: 'var(--space-sm)',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid var(--color-border)'
                        }}>
                            {/* Preview Thumbnail */}
                            <div style={{ width: 60, height: 60, flexShrink: 0, background: '#fff', borderRadius: 'var(--radius-sm)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {item.file.type.startsWith('image/') ? (
                                    <img src={item.preview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    <FileText size={24} color="var(--color-text-secondary)" />
                                )}
                            </div>

                            {/* Info & Inputs */}
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-xs)' }}>
                                    <span style={{ fontWeight: 500, fontSize: '0.9rem', truncate: true, maxWidth: '200px' }}>
                                        {item.file.name}
                                    </span>
                                    <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                                        {(item.file.size / 1024 / 1024).toFixed(2)} MB
                                    </span>
                                </div>
                                <select
                                    className="form-input"
                                    style={{ padding: '4px 8px', fontSize: '0.85rem' }}
                                    value={item.type}
                                    onChange={(e) => handleTypeChange(item.id, e.target.value)}
                                >
                                    {DOCUMENT_TYPES.map(type => (
                                        <option key={type.value} value={type.value}>
                                            {type.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Remove */}
                            <button
                                onClick={(e) => { e.stopPropagation(); handleRemove(item.id); }}
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    cursor: 'pointer',
                                    color: 'var(--color-text-secondary)',
                                    padding: 'var(--space-xs)'
                                }}
                            >
                                <X size={20} />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
