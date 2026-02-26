"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function BlogPage() {
  const [isVisible, setIsVisible] = useState(false);
  const [page, setPage] = useState(1);
  const [cardsPerPage, setCardsPerPage] = useState(6);

  useEffect(() => {
    setIsVisible(true);

    const handleResize = () => {
      if (window.innerWidth < 480) setCardsPerPage(2);
      else if (window.innerWidth < 1024) setCardsPerPage(4);
      else setCardsPerPage(6);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Example blog posts
  const posts = [
    { id: 1, slug: "sim-security", title: "Understanding SIM Security" },
  ];

  const totalPages = Math.ceil(posts.length / cardsPerPage);
  const paginatedPosts = posts.slice((page - 1) * cardsPerPage, page * cardsPerPage);

  return (
    <section className="w-full flex flex-col items-center bg-[#1d1d1d] text-white px-4 sm:px-6 lg:px-8 pt-20 pb-10">

      <div
  className={`w-full max-w-4xl transition-all duration-700 ${
    isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
  }`}
>
  <ul className="divide-y divide-gray-700">
    {paginatedPosts.map((post) => (
      <li key={post.id} className="py-6">
        <Link
          href={`/blog/${post.slug}`}
          className="group block"
        >
          <h2 className="text-lg sm:text-xl font-medium text-white group-hover:opacity-70 transition-opacity">
            {post.title}
          </h2>
          <p className="text-gray-400 text-sm mt-2">
            Read article →
          </p>
        </Link>
      </li>
    ))}
  </ul>
</div>
    </section>
  );
}
