"use client"

import { useState } from "react"
import { AppLayout } from "@/components/layout/app-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { Package, ArrowRight, Loader2, Sparkles, CheckCircle2 } from "lucide-react"
import { motion } from "framer-motion"

interface Offer {
  title: string
  promise: string
  benefits: string[]
  sales_page: string
  email_copy: string
}

export default function OfferPage() {
  const router = useRouter()
  const [niche, setNiche] = useState("")
  const [loading, setLoading] = useState(false)
  const [offer, setOffer] = useState<Offer | null>(null)
  const [error, setError] = useState("")

  const handleGenerate = async () => {
    if (!niche.trim()) {
      setError("Please enter a niche")
      return
    }

    setLoading(true)
    setError("")

    try {
      // API call to http://localhost:8000/api/generate/offer
      const response = await fetch("http://localhost:8000/api/generate/offer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ niche }),
      })

      if (!response.ok) throw new Error("Failed to generate offer")

      const data = await response.json()
      setOffer(data.offer)

      // Store in localStorage
      localStorage.setItem("offer", JSON.stringify(data.offer))
    } catch (err) {
      setError("Failed to generate offer. Please try again.")
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
              <Package className="w-5 h-5 text-primary" />
              AI-Powered Offer Builder
            </CardTitle>
            <CardDescription>Generate a complete offer with sales copy and email sequences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-3">
              <Input
                placeholder="Enter your niche..."
                value={niche}
                onChange={(e) => setNiche(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
                className="flex-1"
              />
              <Button onClick={handleGenerate} disabled={loading} className="gap-2">
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Generate Offer
                  </>
                )}
              </Button>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </CardContent>
        </Card>

        {/* Results Section */}
        {offer && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            {/* Offer Overview */}
            <Card className="border-primary">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl mb-2">{offer.title}</CardTitle>
                    <CardDescription className="text-base">{offer.promise}</CardDescription>
                  </div>
                  <Button size="sm" onClick={() => router.push("/ads")} className="gap-2">
                    Generate Ads
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                    Key Benefits
                  </h3>
                  <ul className="space-y-2">
                    {offer.benefits.map((benefit, index) => (
                      <li key={index} className="flex items-start gap-2 text-muted-foreground">
                        <span className="text-primary mt-1">•</span>
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Sales Page Copy */}
            <Card>
              <CardHeader>
                <CardTitle>Sales Page Copy</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none">
                  <p className="text-muted-foreground whitespace-pre-wrap">{offer.sales_page}</p>
                </div>
              </CardContent>
            </Card>

            {/* Email Copy */}
            <Card>
              <CardHeader>
                <CardTitle>Email Sequence</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none">
                  <p className="text-muted-foreground whitespace-pre-wrap">{offer.email_copy}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </AppLayout>
  )
}
