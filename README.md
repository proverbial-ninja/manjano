# Manjano - Simple Journaling App

![Manjano App Icon](<https://manjano.vercel.app/logo.svg>#center)

Manjano is a simple journaling application built for an interview, focusing on core functionalities and clean architecture.

## Getting Started

1.  **Clone the repository:**

    ```bash
    git clone <your-repository-url>
    cd manjano
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Environment Variables:**

    Create a `.env` file in the root directory and add the following environment variables:

    ```
    DATABASE_URL="postgresql://user:password@host:port/database"
    BASE_URL="http://localhost:4321" # or your deployed url
    GEMINI_API_KEY #gemini api key
    ```

    - `DATABASE_URL`: The connection string for your PostgreSQL database.
    - `BASE_URL`: The base URL of your application.
    - `GEMINI_API_KEY`: A secret string used for Gemini AI.

4.  **Database Migrations and Seeding:**

    - **Migrations:**

      ```bash
      npx drizzle-kit push
      ```

    - **Seeding (Optional):**

      To seed the database with initial data, run the following command:

      ```bash
      npm run seed
      ```

      This will populate the database with some example journal entries.

5.  **Run the development server:**

    ```bash
    npm run dev
    ```

    Open your browser and navigate to `http://localhost:4321`.

## API Endpoints

- **Authentication Endpoints:**
  - See [AUTH.md](AUTH.md) for details on authentication routes.
- **Journal Entry Endpoints:**
  - See [ENTRIES.md](ENTRIES.md) for details on journal entry API routes.

## Login Details

- **Username:** `username@example.com`
- **Password:** `00000000`

## Live Version

A live version of the application is available at [manjano.vercel.app](https://manjano.vercel.app). You can use the same login credentials as above.

## Choices and Reasons

- **Drizzle ORM:**
  - Chosen for its type safety and performance. Drizzle's schema definitions and query builders offer a more robust and predictable database interaction compared to traditional ORMs. It also has a good developer experience.
- **Better Auth (NextAuth.js):**
  - Selected for its ease of integration with Next.js and comprehensive authentication features. It simplifies handling user authentication, including various providers and session management.

## Potential Improvements

- **Advanced Filtering:**
  - Implement more effective filtering options in the journal entry queries, allowing users to search and filter by date ranges, keywords, or tags.
- **Rich Text Editor:**
  - Integrate a rich text editor for journal entries to support formatting, images, and other media.
- **UI/UX improvements:**
  - Adding more UI/UX improvements to provide a better user experience.
- **Testing:**
  - Adding unit and integration tests.

## Privacy and Data Usage

- Implement an **opt-in** feature for AI analysis, clearly explaining the data usage and ensuring user consent.
- Provide transparency about the AI model and its limitations.
- Provide a way for users to delete their analyzed data.
