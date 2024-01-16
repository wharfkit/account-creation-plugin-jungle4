# @wharfkit/account-creation-plugin-jungle4

This plugin allows the creation of Jungle 4 accounts within Wharf projects.

## Usage

-   Install the plugin in your project:

    ```bash
    npm install @wharfkit/account-creation-plugin-jungle
    ```

-   Use the `AccountCreationPluginJungle4` class in your application to facilitate account creation for Jungle environments. Here's an example of how to integrate it:

    ```ts
    import { SessionKit } from "@wharfkit/session";
    import { AccountCreationPluginJungle4 } from "@wharfkit/account-creation-plugin-jungle";

    const sessionKit = new SessionKit(
        {
            // ...other configuration...
        },
        {
            accountCreationPlugins: [new AccountCreationPluginJungle4()],
        }
    );
    ```

## Developing

To contribute to this plugin, you will need [Make](https://www.gnu.org/software/make/), [node.js](https://nodejs.org/en/), and [yarn](https://classic.yarnpkg.com/en/docs/install).

-   Clone the repository and run `make` to check out all dependencies and build the project.
-   See the [Makefile](./Makefile) for other useful targets.
-   Ensure code quality by running `make lint` before submitting a pull request.

---

Made with ☕️ & ❤️ by [Greymass](https://greymass.com). If you find this useful, please consider [supporting us](https://greymass.com/support-us).

---

This version of the README correctly identifies the class name as `AccountCreationPluginJungle4` and provides clear information about the usage and development of the plugin.