import {
    AbstractAccountCreationPlugin,
    AccountCreationPlugin,
    AccountCreationPluginConfig,
    CreateAccountResponse,
    Chains,
    CreateAccountContext,
    Cancelable,
    PromptResponse,
    PrivateKey,
    NameType,
    APIClient,
    FetchProvider,
} from '@wharfkit/session'
import {AccountCreationPluginMetadata} from '@wharfkit/session'

export class AccountCreationPluginJungle4
    extends AbstractAccountCreationPlugin
    implements AccountCreationPlugin
{
    /**
     * The logic configuration for the account-creation plugin.
     */
    readonly config: AccountCreationPluginConfig = {
        // Should the user interface display a chain selector?
        requiresChainSelect: false,

        // Optionally specify if this plugin only works with specific blockchains.
        supportedChains: [Chains.Jungle4],
    }

    /**
     * The metadata for the account-creation plugin to be displayed in the user interface.
     */
    readonly metadata: AccountCreationPluginMetadata = AccountCreationPluginMetadata.from({
        name: 'Jungle4 Testnet Account Creator',
        description: 'Create a Jungle4 testnet account.',
        logo: 'base_64_encoded_image',
        homepage: 'https://someplace.com',
    })

    /**
     * A unique string identifier for this account-creation plugin.
     *
     * It's recommended this is all lower case, no spaces, and only URL-friendly special characters (dashes, underscores, etc)
     */
    get id(): string {
        return 'account-creation-plugin-jungle4'
    }

    /**
     * The name of the account-creation plugin to be displayed in the user interface.
     */
    get name(): string {
        return this.metadata.name
    }

    /**
     * Performs the account creationg logic required to create the account.
     *
     * @param options CreateAccountContext
     * @returns Promise<CreateAccountResponse>
     */
    // TODO: Remove these eslint rule modifiers when you are implementing this method.
    /* eslint-disable @typescript-eslint/no-unused-vars */
    async create(context: CreateAccountContext): Promise<CreateAccountResponse> {
        console.log('jungle4', context)
        const t = context.ui.getTranslate(this.id)

        if (!context.chain) {
            throw Error('No chain selected')
        }

        const chain = context.chain

        const privateKey = PrivateKey.generate('K1')
        const publicKey = privateKey.toPublic()

        // Default to "jungle4"
        const chainUrl = `https://jungle4.greymass.com`

        // Generate a random account name
        const accountName = generateRandomAccountName()

        // Prepare the data for the POST request
        const data = {
            accountName: accountName,
            activeKey: String(publicKey),
            ownerKey: String(publicKey),
            network: String(chain.id),
        }

        // Make the POST request to create the account
        const response = await fetch(`${chainUrl}/account/create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        })

        // If JSON was returned, it contains an error
        const contentType = response.headers.get('content-type')
        if (contentType && contentType.indexOf('application/json') !== -1) {
            const json = await response.json()
            throw new Error(`There was an error creating this account (${json.message})`)
        }

        // Prompt the user with the results
        const prompt: Cancelable<PromptResponse> = context.ui.prompt({
            title: t('title', {default: 'Testnet Account Created!'}),
            body: t('body', {
                default:
                    'Your account has been created. Please save the private key below someplace safe and import it into your wallet.',
            }),
            elements: [
                {
                    type: 'qr',
                    data: String(privateKey),
                },
                {
                    type: 'button',
                    data: {
                        label: 'Copy to Clipboard',
                        onClick: async () => {
                            await navigator.clipboard.writeText(String(privateKey))
                        },
                        variant: 'secondary',
                    },
                },
            ],
        })

        // Return the promise from the prompt
        return prompt.then(async () => {
            return new Promise((r) =>
                r({
                    chain,
                    accountName: data.accountName,
                })
            )
        })
    }
}

function makeClient(url: string): APIClient {
    const provider = new FetchProvider(url, {fetch})
    return new APIClient({provider})
}

function generateRandomAccountName(): string {
    // Generate a random 12-character account name using the allowed characters for Antelope accounts
    const characters = 'abcdefghijklmnopqrstuvwxyz12345'
    let result = ''
    for (let i = 0; i < 9; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length))
    }
    return `${result}.gm`
}

async function checkAccountNameExists(accountName: NameType, chainUrl: string): Promise<boolean> {
    const client = makeClient(chainUrl)

    try {
        const account = await client.v1.chain.get_account(accountName)

        return !!account?.account_name
    } catch (error: unknown) {
        const errorMessage = (error as {message: string}).message

        if (errorMessage.includes('Account not found')) {
            return false
        }

        throw Error(`Error checking if account name exists: ${errorMessage}`)
    }
}
