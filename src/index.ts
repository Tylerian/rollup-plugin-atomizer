//@ts-ignore
import Atomizer from "atomizer";
import { OutputBundle } from "rollup";
import { createFilter } from "rollup-pluginutils";

type AtomizerConfig = {
    breakPoints: object;
    classNames?: string[];
    custom: object;
    exclude?: string[];
}

type AtomizerCssOptions = {
    banner: string;
    helpersNamespace: string;
    ie: boolean;
    namespace: string;
    rtl: boolean;
};

type AtomizerOptions = {
    config: AtomizerConfig;
    cssOptions: AtomizerCssOptions;
    exclude: string | string[];
    include: string | string[];
    rules: object;
    verbose: boolean;
    outputFile: string;
};

export default function atomizer(options: AtomizerOptions) {
    const atomzr = new Atomizer({
        verbose: options.verbose
    });
    const filter = createFilter(options.include, options.exclude);
    const lookup = new Map<string, Array<string>>();

    return {
        /* The name of this plugin */
        name: 'atomizer',

        /* TODO: Check plugin options */
        // buildStart(_: InputOptions)

        /* Extract atomic css classes from each file that has changed */
        transform(code: string, id: string) {
            // Find only if file is included
            if (filter(id)) {
                // Find atomic classes and add them to our cache
                lookup.set(id, atomzr.findClassNames(code));
            }

            // no side effects
            return null;
        },

        /** Recopile all changes and write them to the output file if needed. */
        generateBundle(_: OutputBundle) {
            const cls = Array.from(lookup.values()).flat();
            const cfg = atomzr.getConfig(cls, options.config);
            const css = atomzr.getCss(cfg, options.cssOptions);
            
            // emitFile available?
            if (this.emitFile) {
                this.emitFile({
                    type: "asset",
                    source: css,
                    fileName: options.outputFile || "atomic.css"
                });
            } else {
                // TODO: Deprecate this once new emitFile api is stable
                this.emitAsset(options.outputFile || "atomic.css", css);
            }
        }
    };
}