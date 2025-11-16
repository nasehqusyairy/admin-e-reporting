import type { User } from "firebase/auth";
import { createContext } from "react-router";

export const userContext = createContext<User | null>(null);
