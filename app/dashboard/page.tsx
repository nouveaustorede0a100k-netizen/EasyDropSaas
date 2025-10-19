"use client"

import { useState } from "react"
import { AppLayout } from "@/components/layout/app-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { TrendingUp, ArrowRight, Loader2 } from "lucide-react"
import { motion } from "framer-motion"

interface Topic {
  name: string
  score: number
  related_terms: string[]
}

export default function DashboardPage() {
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [loading, setLoading] = useState(false)
  const [topics, setTopics] = useState<Topic[]>([])
  const [error, setError] = useState("")

  const handleSearch = async () => {
    if (!query.trim()) {
      setError("Please enter a skill or topic")
      return
    }

    setLoading(true)
    setError("")

    try {
      // API call to http://localhost:8000/api/topics/search
      const response = await fetch("http://localhost:8000/api/topics/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      })

      if (!response.ok) throw new Error("Failed to fetch trends")

      const data = await response.json()
      setTopics(data.topics || [])

      // Store in localStorage for later use
      localStorage.setItem("searchQuery", query)
      localStorage.setItem("topics", JSON.stringify(data.topics || []))
    } catch (err) {
      setError("Failed to analyze trends. Please try again.")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Search Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Discover Trending Topics
            </CardTitle>
            <CardDescription>
              Enter a skill or thematic area to analyze current trends and opportunities
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-3">
              <Input
                placeholder="e.g., design, nutrition, AI, productivity..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="flex-1"
              />
              <Button onClick={handleSearch} disabled={loading} className="gap-2">
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <TrendingUp className="w-4 h-4" />
                    Analyze Trends
                  </>
                )}
              </Button>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </CardContent>
        </Card>

        {/* Results Section */}
        {topics.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">Trending Topics</h2>
              <Button variant="outline" size="sm" onClick={() => router.push("/products")} className="gap-2">
                Analyze Products
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>

            <div className="grid gap-4">
              {topics.map((topic, index) => (
                <Card key={index} className="hover:border-primary transition-colors">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-semibold text-lg text-foreground">{topic.name}</h3>
                      <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                        <TrendingUp className="w-4 h-4" />
                        {topic.score}%
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {topic.related_terms.map((term, i) => (
                        <span key={i} className="px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-sm">
                          {term}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </AppLayout>
  )
}
