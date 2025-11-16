import type { URLSearchParamsInit } from "react-router";

/**
 * Memperbarui search params berdasarkan isi form.
 * Hanya memodifikasi field yang ada di form, param lain dipertahankan.
 */
export function updateSearchParamsFromForm(
    e: React.FormEvent<HTMLFormElement>,
    currentParams: URLSearchParams,
    setSearchParams: (nextInit: URLSearchParamsInit) => void
) {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);

    // Salin params lama agar param lain tetap ada
    const next = new URLSearchParams(currentParams.toString());

    // Loop seluruh input di form
    for (const [key, value] of formData.entries()) {
        const trimmed = String(value).trim();
        if (trimmed) next.set(key, trimmed);
        else next.delete(key);
    }

    // Update query string di URL tanpa reload
    setSearchParams(next);
}
