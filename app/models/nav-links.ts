import { Book, BookOpen, Gauge, Table } from "lucide-react";

export const navLinks = [
    {
        name: "Dashboard",
        url: "/",
        icon: Gauge,
    },
    {
        name: "Dokumen Audit",
        url: "/audits",
        icon: Table,
    },
    {
        name: "Kategori",
        url: "/categories",
        icon: Book,
    },
    {
        name: "Sub Kategori",
        url: "/subcategories",
        icon: BookOpen,
    }
]