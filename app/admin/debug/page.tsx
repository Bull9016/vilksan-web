import { getProducts } from "@/app/actions/product";

export const dynamic = 'force-dynamic';

export default async function DebugPage() {
    const products = await getProducts();

    return (
        <div className="p-10 font-mono text-xs">
            <h1 className="text-xl font-bold mb-4">Product Debugger</h1>
            <table className="w-full border-collapse border border-gray-500">
                <thead>
                    <tr className="bg-gray-200 dark:bg-gray-800">
                        <th className="border p-2">ID</th>
                        <th className="border p-2">Title</th>
                        <th className="border p-2">Cover Image (DB)</th>
                        <th className="border p-2">Media[0] (DB)</th>
                        <th className="border p-2">Media Count</th>
                    </tr>
                </thead>
                <tbody>
                    {products.map(p => (
                        <tr key={p.id}>
                            <td className="border p-2">{p.id}</td>
                            <td className="border p-2">{p.title}</td>
                            <td className="border p-2 text-blue-600 break-all">{p.cover_image || "NULL/UNDEFINED"}</td>
                            <td className="border p-2 text-green-600 break-all">{p.media?.[0] || "NULL"}</td>
                            <td className="border p-2">{p.media?.length || 0}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
