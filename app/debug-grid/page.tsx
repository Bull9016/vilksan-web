
import { getGridItems } from "@/app/actions/content";
import { createClient } from "@/utils/supabase/server";

export const dynamic = 'force-dynamic';

export default async function DebugGridPage() {
    let gridItems: any[] = [];
    let directData = null;
    let directError = null;
    let pageError = null;
    let envCheck = {
        url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        key: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    };

    try {
        // Simulate high concurrency like in Home page
        const results = await Promise.all([
            getGridItems(),
            getGridItems(),
            getGridItems(),
            getGridItems(),
            getGridItems()
        ]);
        gridItems = results[0];

        const supabase = await createClient();
        const result = await supabase
            .from('home_grid_items')
            .select('*');
        directData = result.data;
        directError = result.error;
    } catch (e: any) {
        pageError = {
            message: e.message,
            stack: e.stack,
            string: String(e)
        };
    }

    return (
        <div className="p-10 font-mono text-sm">
            <h1 className="text-2xl font-bold mb-4">Grid Debug (Concurrent Test)</h1>

            <div className="mb-8 p-4 border rounded">
                <h2 className="text-xl mb-2">Environment Check</h2>
                <p>NEXT_PUBLIC_SUPABASE_URL: {envCheck.url ? 'Defined' : 'Missing'}</p>
                <p>NEXT_PUBLIC_SUPABASE_ANON_KEY: {envCheck.key ? 'Defined' : 'Missing'}</p>
            </div>

            {pageError ? (
                <div className="mb-8 p-4 border rounded bg-red-100 text-red-900">
                    <h2 className="text-xl mb-2 font-bold">Page Execution Error</h2>
                    <pre className="whitespace-pre-wrap">{JSON.stringify(pageError, null, 2)}</pre>
                </div>
            ) : (
                <>
                    <div className="mb-8 p-4 border rounded">
                        <h2 className="text-xl mb-2">getGridItems() Result (1 of 5)</h2>
                        <pre className="bg-gray-100 p-2 overflow-auto max-h-60">
                            {JSON.stringify(gridItems, null, 2)}
                        </pre>
                    </div>

                    <div className="mb-8 p-4 border rounded">
                        <h2 className="text-xl mb-2">Direct Query Result</h2>
                        {directError ? (
                            <div className="text-red-500">
                                <p>Error:</p>
                                <pre>{JSON.stringify(directError, null, 2)}</pre>
                            </div>
                        ) : (
                            <pre className="bg-gray-100 p-2 overflow-auto max-h-60">
                                {JSON.stringify(directData, null, 2)}
                            </pre>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
