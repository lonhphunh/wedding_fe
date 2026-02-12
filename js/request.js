import { dto } from './dto.js';
import { session } from './session.js';

export const HTTP_GET = 'GET';
export const HTTP_POST = 'POST';
export const HTTP_PUT = 'PUT';
export const HTTP_PATCH = 'PATCH';
export const HTTP_DELETE = 'DELETE';

const DEFAULT_TIMEOUT_MS = 15000;

const parseResponse = async (res) => {
    const contentType = res.headers.get('content-type') ?? '';
    const text = await res.text();

    if (!text) {
        return {};
    }

    if (contentType.includes('application/json')) {
        return JSON.parse(text);
    }

    try {
        return JSON.parse(text);
    } catch {
        return { message: text };
    }
};

const toErrorMessage = (json, fallback) => {
    if (!json) {
        return fallback;
    }

    if (Array.isArray(json.error) && json.error.length > 0) {
        return json.error[0];
    }

    if (Array.isArray(json) && json.length > 0) {
        return json[0];
    }

    return json.message || fallback;
};

export const request = (method, path) => {

    let url = document.body.getAttribute('data-url');
    const controller = new AbortController();
    const req = {
        method: method,
        signal: controller.signal,
        headers: new Headers({
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        })
    };

    if (url.slice(-1) === '/') {
        url = url.slice(0, -1);
    }

    return {
        /**
         * @template T
         * @param {((data: any) => T)=} transform
         * @returns {Promise<ReturnType<typeof dto.baseResponse<T>>>}
         */
        send(transform = null) {
            const timeout = window.setTimeout(() => {
                controller.abort();
            }, DEFAULT_TIMEOUT_MS);

            return fetch(url + path, req)
                .then(async (res) => {
                    const json = await parseResponse(res);

                    if (!res.ok) {
                        const fallback = `Request failed with status ${res.status}`;
                        throw new Error(toErrorMessage(json, fallback));
                    }

                    return json;
                })
                .then((res) => {
                    if (transform) {
                        res.data = transform(res.data);
                    }

                    return dto.baseResponse(res.code, res.data, res.error);
                })
                .catch((err) => {
                    const message = err.name === 'AbortError' ? 'Request timeout, please try again.' : err.message;
                    console.error('[request.send] failed', { method, path, message, error: err });
                    throw err;
                })
                .finally(() => {
                    window.clearTimeout(timeout);
                });
        },
        download() {
            return fetch(url + path, req)
                .then((res) => {
                    if (res.status !== 200) {
                        return null;
                    }

                    const existingLink = document.querySelector('a[download]');
                    if (existingLink) {
                        document.body.removeChild(existingLink);
                    }

                    const filename = res.headers.get('content-disposition')?.match(/filename="(.+)"/)?.[1] || 'download.csv';
                    return res.blob().then((blob) => ({ blob, filename }));
                })
                .then((res) => {
                    if (!res) {
                        return null;
                    }

                    const { blob, filename } = res;

                    const link = document.createElement('a');
                    const href = window.URL.createObjectURL(blob);

                    link.href = href;
                    link.download = filename;
                    document.body.appendChild(link);

                    link.click();

                    document.body.removeChild(link);
                    window.URL.revokeObjectURL(href);

                })
                .catch((err) => {
                    console.error('[request.download] failed', { method, path, error: err });
                    throw err;
                });
        },
        silent(value = true) {
            silent = value;
            return this;
        },
        token(token) {
            if (session.isAdmin()) {
                req.headers.append('Authorization', 'Bearer ' + token);
                return this;
            }

            req.headers.append('x-access-key', token);
            return this;
        },
        body(body) {
            req.body = JSON.stringify(body);
            return this;
        },
    };
};
