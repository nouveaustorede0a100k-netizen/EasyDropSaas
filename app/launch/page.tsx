"use client"

import { useState, useEffect } from "react"
import { AppLayout } from "@/components/layout/app-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { Rocket, CheckCircle2, Circle, Download, RotateCcw } from "lucide-react"
import { motion } from "framer-motion"

interface LaunchStep {
  id: string
  title: string
  description: string
  completed: boolean
}

export default function LaunchPage() {
  const router = useRouter()
  const [niche, setNiche] = useState("")
  const [offerTitle, setOfferTitle] = useState("")
  const [steps, setSteps] = useState<LaunchStep[]>([
    {
      id: "1",
      title: "Validate Your Niche",
      description: "Confirm market demand and competition analysis",
      completed: false,
    },
    {
      id: "2",
      title: "Create Product Content",
      description: "Develop your digital product or course materials",
      completed: false,
    },
    {
      id: "3",
      title: "Build Sales Page",
      description: "Set up landing page with compelling copy",
      completed: false,
    },
    {
      id: "4",
      title: "Launch Ad Campaigns",
      description: "Test your ad variations and optimize",
      completed: false,
    },
    {
      id: "5",
      title: "Collect Feedback",
      description: "Gather customer insights and iterate",
      completed: false,
    },
  ])

  useEffect(() => {
    // Load data from localStorage
    const storedNiche = localStorage.getItem("niche") || localStorage.getItem("searchQuery") || ""
    const storedOffer = localStorage.getItem("offer")

    setNiche(storedNiche)
    if (storedOffer) {
      try {
        const offer = JSON.parse(storedOffer)
        setOfferTitle(offer.title || "")
      } catch (e) {
        console.error("Failed to parse offer", e)
      }
    }
  }, [])

  const toggleStep = (id: string) => {
    setSteps(steps.map((step) => (step.id === id ? { ...step, completed: !step.completed } : step)))
  }

  const handleRestart = () => {
    localStorage.clear()
    router.push("/dashboard")
  }

  const handleExport = () => {
    alert("Export functionality would generate a PDF or Notion page with your launch plan")
  }

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Summary Card */}
        <Card className="border-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Rocket className="w-6 h-6 text-primary" />
              Launch Plan Summary
            </CardTitle>
            <CardDescription>Your complete roadmap to launching your digital product</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {niche && (
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-1">Niche</h3>
                <p className="text-foreground font-medium">{niche}</p>
              </div>
            )}
            {offerTitle && (
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-1">Offer</h3>
                <p className="text-foreground font-medium">{offerTitle}</p>
              </div>
            )}
            <div className="flex gap-3 pt-2">
              <Button onClick={handleExport} variant="outline" className="gap-2 bg-transparent">
                <Download className="w-4 h-4" />
                Export Plan
              </Button>
              <Button onClick={handleRestart} variant="outline" className="gap-2 bg-transparent">
                <RotateCcw className="w-4 h-4" />
                Start New Project
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Launch Steps */}
        <Card>
          <CardHeader>
            <CardTitle>Launch Checklist</CardTitle>
            <CardDescription>Follow these steps to successfully launch your digital product</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {steps.map((step, index) => (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`flex items-start gap-4 p-4 rounded-lg border transition-colors cursor-pointer ${
                    step.completed ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                  }`}
                  onClick={() => toggleStep(step.id)}
                >
                  <div className="mt-0.5">
                    {step.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-primary" />
                    ) : (
                      <Circle className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className={`font-semibold mb-1 ${step.completed ? "text-primary" : "text-foreground"}`}>
                      {step.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Next Steps */}
        <Card>
          <CardHeader>
            <CardTitle>Ready to Launch?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              You've completed the planning phase! Now it's time to execute your launch strategy. Remember to track your
              metrics, gather feedback, and iterate based on real user data.
            </p>
            <div className="flex gap-3">
              <Button onClick={() => router.push("/dashboard")} className="gap-2">
                <Rocket className="w-4 h-4" />
                Start Another Project
              </Button>
              <Button variant="outline" onClick={handleExport}>
                Download Full Plan
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
