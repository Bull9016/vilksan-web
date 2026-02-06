import { getContent } from "@/app/actions/content";
// import { getBlogs } from "@/app/actions/blog";
import { getProducts, getCollections, type Product, type Collection } from "@/app/actions/product";
import { getCategories, type Category } from "@/app/actions/category";
import { getGridItems } from "@/app/actions/content";
import HomeClient from "@/components/home/HomeClient";

// Force dynamic rendering to ensure fresh data
export const dynamic = 'force-dynamic';

export default async function Home() {
  // Fetch all necessary content server-side
  const keys = [
    "site_logo",
    "home_hero_bg_text",
    "home_hero_main_image",
    "home_hero_slides", // Fetch carousel slides
    "home_hero_badge",
    "home_hero_badge",
    "home_hero_subline",
    "home_collection_title",
    "home_collection_desc",
    "home_collection_cta_link",
    "home_collection_image",
    "home_hero_text_position",
    // Philosophy Section
    "home_philosophy_title",
    "home_philosophy_text",
    "home_philosophy_image",
    // Editorial Section
    "home_editorial_title",
    "home_editorial_text",
    "home_editorial_image",
    // Newsletter Section
    "home_newsletter_title",
    "home_newsletter_desc",
    "home_featured_categories"
  ];

  const [contentEntries, newArrivals, collections, gridItems] = await Promise.all([
    Promise.all(
      keys.map(async (key) => {
        const data = await getContent(key);
        // data is now { value, style }
        return [key, data];
      })
    ),
    getProducts({ sort: "newest" }),
    getCollections(),
    getGridItems()
  ]);

  const contentMap = Object.fromEntries(contentEntries);


  // ... imports

  // ... inside Home function

  // --- Resolve Category Showcase Data ---
  let categoryShowcaseData: ((Collection | Category) & { products: Product[] })[] = [];
  try {
    const showcaseMode = contentMap["home_showcase_mode"]?.value || "collections";
    const featCatJson = contentMap["home_featured_categories"]?.value;

    if (featCatJson) {
      const ids: string[] = JSON.parse(featCatJson);

      if (showcaseMode === "categories") {
        // Fetch Categories
        // We need to fetch all categories first to filter by ID (or fetch individually)
        // For efficiency, let's fetch all (usually < 20)
        const allCategories = await getCategories();

        const showcasePromises = ids.map(async (id) => {
          const category = allCategories.find(c => c.id === id);
          if (!category) return null;
          const products = await getProducts({ category: id, sort: "newest" });
          return { ...category, products: products.slice(0, 4) };
        });

        const resolved = await Promise.all(showcasePromises);
        categoryShowcaseData = resolved.filter(Boolean) as (Category & { products: Product[] })[];

      } else {
        // Fetch Collections (Default)
        const showcasePromises = ids.map(async (id) => {
          const collection = collections.find(c => c.id === id);
          if (!collection) return null;
          const products = await getProducts({ collection: id, sort: "newest" });
          return { ...collection, products: products.slice(0, 4) };
        });

        const resolved = await Promise.all(showcasePromises);
        categoryShowcaseData = resolved.filter(Boolean) as (Collection & { products: Product[] })[];
      }
    }
  } catch (e) {
    console.error("Failed to load category showcase", e);
  }

  const latestBlog = null;

  return (
    <HomeClient
      content={contentMap}
      latestBlog={latestBlog}
      newArrivals={newArrivals.slice(0, 8)}
      collections={collections}
      categoryShowcase={categoryShowcaseData}
      gridItems={gridItems}
    />
  );
}
