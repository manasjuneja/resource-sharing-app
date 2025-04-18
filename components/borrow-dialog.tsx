"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { api } from "@/lib/api"
import type { Item } from "@/lib/types"
import { format, addDays } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface BorrowDialogProps {
  item: Item
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function BorrowDialog({ item, open, onOpenChange }: BorrowDialogProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [startDate, setStartDate] = useState<Date>(new Date())
  const [endDate, setEndDate] = useState<Date>(addDays(new Date(), item.duration || 7))
  const [message, setMessage] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await api.post("/api/borrow-requests", {
        itemId: item.id,
        startDate,
        endDate,
        message,
      })

      toast({
        title: "Success",
        description: "Your borrow request has been submitted",
      })

      onOpenChange(false)
      router.push("/dashboard/my-requests")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit borrow request",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Request to Borrow: {item.title}</DialogTitle>
            <DialogDescription>Fill out the details to request borrowing this item.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="start-date">Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button id="start-date" variant="outline" className="justify-start text-left font-normal">
                    {format(startDate, "PPP")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={(date) => date && setStartDate(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="end-date">End Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button id="end-date" variant="outline" className="justify-start text-left font-normal">
                    {format(endDate, "PPP")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={(date) => date && setEndDate(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="message">Message to Owner (Optional)</Label>
              <Textarea
                id="message"
                placeholder="Tell the owner why you need this item..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Submitting..." : "Submit Request"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
