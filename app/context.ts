import { createContext } from "react-router";
import type { ICategory } from "./models/schema";

// Create a context for user data
export const subCategoryContext = createContext({ categoryMap: {} as Record<string, ICategory> });
