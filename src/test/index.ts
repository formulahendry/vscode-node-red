import * as glob from "glob";
import * as Mocha from "mocha";
import * as path from "path";

export function run(): Promise<void> {
    const testDir = path.resolve(__dirname);

    const mocha: Mocha = new Mocha(
        {
            ui: "tdd"
        });

    return new Promise<void>(
        (resolve, reject) => {
            glob(
                "**/*.test.js",
                {
                    cwd: __dirname
                },
                (error, matches) => {
                    if (error) {
                        reject(error);
                    }

                    matches.forEach((file) => mocha.addFile(path.resolve(testDir, file)));

                    mocha.run(
                        (failures) => {
                            if (failures > 0) {
                                reject(new Error(`${failures} test${failures > 1 ? "" : "s"} failed!`));
                            } else {
                                resolve();
                            }
                        });
                });
        });
}
