import { guest } from './guest.js';

export const progress = (() => {

    const LOAD_TIMEOUT_MS = 10000;

    let info = null;
    let bar = null;

    let total = 0;
    let loaded = 0;
    let push = true;

    const settledAssets = new WeakSet();

    const updateBar = (type, isError = false) => {
        const percent = total > 0 ? Math.min((loaded / total) * 100, 100) : 100;
        const label = isError ? 'Error loading' : 'Loading';

        bar.style.width = `${percent}%`;
        info.innerText = `${label} ${type} (${loaded}/${total}) [${Math.round(percent)}%]`;

        if (isError) {
            bar.style.backgroundColor = 'red';
        }
    };

    const finish = () => {
        updateBar('complete');
        guest.name();
    };

    const add = () => {
        if (!push) {
            return;
        }

        total += 1;
    };

    const settle = (type, isError = false) => {
        loaded += 1;
        updateBar(type, isError);

        if (loaded >= total) {
            finish();
        }
    };

    const settleAsset = (asset, type, isError = false) => {
        if (settledAssets.has(asset)) {
            return;
        }

        settledAssets.add(asset);
        settle(type, isError);
    };

    const complete = (type = 'asset') => {
        settle(type);
    };

    const invalid = (type = 'asset') => {
        settle(type, true);
    };

    const watchImage = (asset) => {
        const timeout = window.setTimeout(() => {
            settleAsset(asset, 'image timeout', true);
        }, LOAD_TIMEOUT_MS);

        const done = (isError) => {
            window.clearTimeout(timeout);
            settleAsset(asset, 'image', isError);
        };

        asset.addEventListener('load', () => done(false), { once: true });
        asset.addEventListener('error', () => done(true), { once: true });

        if (asset.complete) {
            done(!(asset.naturalWidth > 0 && asset.naturalHeight > 0));
        }
    };

    const run = () => {
        const images = Array.from(document.querySelectorAll('img'));

        if (images.length === 0) {
            finish();
            return;
        }

        images.forEach(watchImage);
    };

    const init = () => {
        document.querySelectorAll('img').forEach(add);

        info = document.getElementById('progress-info');
        bar = document.getElementById('progress-bar');

        if (!info || !bar) {
            guest.name();
            return;
        }

        info.style.display = 'block';
        push = false;

        if (total === 0) {
            finish();
            return;
        }

        run();
    };

    return {
        init,
        add,
        invalid,
        complete,
    };
})();
