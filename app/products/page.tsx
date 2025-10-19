"use client"

import { useState } from "react"
import { AppLayout } from "@/components/layout/app-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { Search, ArrowRight, Loader2, ExternalLink } from "lucide-react"
import { motion } from "framer-motion"

interface Product {
  title: string
  platform: string
  price: string
  url?: string
}

export default function ProductsPage() {
  const router = useRouter()
  const [niche, setNiche] = useState("")
  const [loading, setLoading] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [error, setError] = useState("")

  const handleSearch = async () => {
    if (!niche.trim()) {
      setError("Please enter a niche")
      return
    }

    setLoading(true)
    setError("")

    try {
      // API call to http://localhost:8000/api/products/search
      const response = await fetch("http://localhost:8000/api/products/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ niche }),
      })

      if (!response.ok) throw new Error("Failed to fetch products")

      const data = await response.json()
      setProducts(data.products || [])

      // Store in localStorage
      localStorage.setItem("niche", niche)
      localStorage.setItem("products", JSON.stringify(data.products || []))
    } catch (err) {
      setError("Failed to find products. Please try again.")
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
              <Search className="w-5 h-5 text-primary" />
              Find Winning Products
            </CardTitle>
            <CardDescription>
              Search for successful digital products in your niche to understand the market
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-3">
              <Input
                placeholder="e.g., UX design, fitness coaching, productivity tools..."
                value={niche}
                onChange={(e) => setNiche(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="flex-1"
              />
              <Button onClick={handleSearch} disabled={loading} className="gap-2">
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    Search Products
                  </>
                )}
              </Button>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </CardContent>
        </Card>

        {/* Results Section */}
        {products.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">Winning Products in {niche}</h2>
              <Button variant="outline" size="sm" onClick={() => router.push("/offer")} className="gap-2">
                Build Offer
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>

            <div className="grid gap-4">
              {products.map((product, index) => (
                <Card key={index} className="hover:border-primary transition-colors">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg text-foreground mb-2">{product.title}</h3>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <span className="font-medium">Platform:</span>
                            {product.platform}
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="font-medium">Price:</span>
                            <span className="text-primary font-semibold">{product.price}</span>
                          </span>
                        </div>
                      </div>
                      {product.url && (
                        <Button variant="ghost" size="sm" asChild>
                          <a href={product.url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </Button>
                      )}
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
