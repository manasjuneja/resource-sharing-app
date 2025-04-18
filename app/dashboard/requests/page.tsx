"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"
import { api } from "@/lib/api"
import type { BorrowRequest } from "@/lib/types"
import { format } from "date-fns"

export default function RequestsPage() {
  const { user } = useAuth()
  const [requests, setRequests] = useState<BorrowRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await api.get("/api/my-items/requests")
        setRequests(response.data)
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch borrow requests",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (user) {
      fetchRequests()
    }
  }, [user])

  const handleApproveRequest = async (id: number) => {
    try {
      await api.put(`/api/borrow-requests/${id}/approve`)

      // Update the local state
      setRequests(requests.map((request) => (request.id === id ? { ...request, status: "approved" } : request)))

      toast({
        title: "Success",
        description: "Request approved successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to approve request",
        variant: "destructive",
      })
    }
  }

  const handleDenyRequest = async (id: number) => {
    try {
      await api.put(`/api/borrow-requests/${id}/deny`)

      // Update the local state
      setRequests(requests.map((request) => (request.id === id ? { ...request, status: "denied" } : request)))

      toast({
        title: "Success",
        description: "Request denied successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to deny request",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Borrow Requests</h1>

      {requests.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-10 w-10 text-muted-foreground"
              >
                <rect width="18" height="18" x="3" y="3" rx="2" />
                <path d="M7 10h10" />
                <path d="M7 14h10" />
              </svg>
            </div>
            <h2 className="mt-4 text-xl font-semibold">No borrow requests</h2>
            <p className="mt-2 text-center text-muted-foreground">
              You don't have any borrow requests for your items yet.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <Card key={request.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="line-clamp-1">Request for: {request.item.title}</CardTitle>
                  <Badge
                    variant={
                      request.status === "pending"
                        ? "outline"
                        : request.status === "approved"
                          ? "default"
                          : "destructive"
                    }
                  >
                    {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <h3 className="font-semibold">Borrower Details</h3>
                    <p className="text-sm">{request.buyer.name}</p>
                    <p className="text-sm text-muted-foreground">{request.buyer.email}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold">Borrowing Period</h3>
                    <p className="text-sm">From: {format(new Date(request.startDate), "PPP")}</p>
                    <p className="text-sm">To: {format(new Date(request.endDate), "PPP")}</p>
                  </div>
                </div>
                {request.message && (
                  <div className="mt-4">
                    <h3 className="font-semibold">Message</h3>
                    <p className="text-sm">{request.message}</p>
                  </div>
                )}
              </CardContent>
              {request.status === "pending" && (
                <CardFooter className="flex justify-end gap-2">
                  <Button variant="destructive" size="sm" onClick={() => handleDenyRequest(request.id)}>
                    Deny
                  </Button>
                  <Button size="sm" onClick={() => handleApproveRequest(request.id)}>
                    Approve
                  </Button>
                </CardFooter>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
