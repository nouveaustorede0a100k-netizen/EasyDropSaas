"use client"

import { useState } from "react"
import { AppLayout } from "@/components/layout/app-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { Megaphone, ArrowRight, Loader2, Sparkles } from "lucide-react"
import { motion } from "framer-motion"

interface Ad {
  headline: string
  primary_text: string
  call_to_action: string
}

export default function AdsPage() {
  const router = useRouter()
  const [niche, setNiche] = useState("")
  const [title, setTitle] = useState("")
  const [loading, setLoading] = useState(false)
  const [ads, setAds] = useState<Ad[]>([])
  const [error, setError] = useState("")

  const handleGenerate = async () => {
    if (!niche.trim() || !title.trim()) {
      setError("Please enter both niche and offer title")
      return
    }

    setLoading(true)
    setError("")

    try {
      // API call to http://localhost:8000/api/generate/ads
      const response = await fetch("http://localhost:8000/api/generate/ads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ niche, title }),
      })

      if (!response.ok) throw new Error("Failed to generate ads")

      const data = await response.json()
      setAds(data.ads || [])

      // Store in localStorage
      localStorage.setItem("ads", JSON.stringify(data.ads || []))
    } catch (err) {
      setError("Failed to generate ads. Please try again.")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Generate Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-primary" />
              AI Ad Generator
            </CardTitle>
            <CardDescription>Create high-converting ad copy for your digital product</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3">
              <Input
                placeholder="Your niche (e.g., productivity, fitness)..."
                value={niche}
                onChange={(e) => setNiche(e.target.value)}
              />
              <Input
                placeholder="Your offer title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
              />
            </div>
            <Button onClick={handleGenerate} disabled={loading} className="w-full gap-2">
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating Ads...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate Winning Ads
                </>
              )}
            </Button>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </CardContent>
        </Card>

        {/* Results Section */}
        {ads.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">Generated Ad Variations</h2>
              <Button variant="outline" size="sm" onClick={() => router.push("/launch")} className="gap-2">
                Launch Plan
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>

            <div className="grid gap-4">
              {ads.map((ad, index) => (
                <Card key={index} className="hover:border-primary transition-colors">
                  <CardHeader>
                    <CardTitle className="text-lg">Ad Variation {index + 1}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="text-sm font-semibold text-muted-foreground mb-1">Headline</h4>
                      <p className="text-foreground font-medium">{ad.headline}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-muted-foreground mb-1">Primary Text</h4>
                      <p className="text-muted-foreground">{ad.primary_text}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-muted-foreground mb-1">Call to Action</h4>
                      <Button size="sm" className="mt-1">
                        {ad.call_to_action}
                      </Button>
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
