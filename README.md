# Ghostify

[About the project and inspiration](/src//docs//about.md)

## Run the project locally

1. Clone the repository.
2. Install dependencies `pnpm install`.
3. Run `pnpm dev`.

### Env Variables

A `.env` file is required to be on the root of the project.

Ghostify uses Groq as its LLM provider to get the fastest response times possible.

To Host your own instance of Ghostify, you will need to get a Groq API key found [here](https://groq.com/docs/api-reference/introduction).

Your Env file should look like this:

```env
GROQ_API_KEY=""
```

