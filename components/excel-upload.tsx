"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Upload } from "lucide-react"
import * as XLSX from "xlsx"
import { supabase } from "@/lib/supabase"
import { Progress } from "@/components/ui/progress"

export function ExcelUpload({ onSuccess }: { onSuccess?: () => void }) {
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const { toast } = useToast()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0])
    }
  }

  const handleUpload = async () => {
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select an Excel file to upload.",
        variant: "destructive",
      })
      return
    }

    if (!file.name.endsWith(".xlsx") && !file.name.endsWith(".xls")) {
      toast({
        title: "Invalid file format",
        description: "Please upload an Excel file (.xlsx or .xls).",
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)
    setProgress(10)

    try {
      // Read the Excel file
      const data = await file.arrayBuffer()
      const workbook = XLSX.read(data)
      const worksheet = workbook.Sheets[workbook.SheetNames[0]]
      const jsonData = XLSX.utils.sheet_to_json(worksheet)

      setProgress(30)

      if (jsonData.length === 0) {
        throw new Error("No data found in the Excel file")
      }

      // Map Excel data to our database schema
      const volunteers = jsonData.map((row: any) => {
        return {
          serial_number: row.serial_number?.toString() || row.SerialNumber?.toString() || null,
          full_name: row.full_name || row.FullName || row.Name || "",
          age: row.age || row.Age ? Number.parseInt(row.age || row.Age) : null,
          aadhar_number: row.aadhar_number?.toString() || row.AadharNumber?.toString() || null,
          sevadal_training_certificate: Boolean(row.sevadal_training_certificate || row.SevadalTraining || false),
          mobile_number: row.mobile_number?.toString() || row.MobileNumber?.toString() || null,
          sss_district: row.sss_district || row.SSSDistrict || row.District || null,
          samiti_or_bhajan_mandli: row.samiti_or_bhajan_mandli || row.Samiti || row.BhajanMandli || null,
          education: row.education || row.Education || null,
          special_qualifications: row.special_qualifications || row.SpecialQualifications || row.Qualifications || null,
          past_prashanti_service: Boolean(row.past_prashanti_service || row.PastService || false),
          last_service_location: row.last_service_location || row.LastServiceLocation || null,
          other_service_location: row.other_service_location || row.OtherServiceLocation || null,
          prashanti_arrival: row.prashanti_arrival || row.PrashantiArrival || null,
          prashanti_departure: row.prashanti_departure || row.PrashantiDeparture || null,
          duty_point: row.duty_point || row.DutyPoint || null,
          is_cancelled: Boolean(row.is_cancelled || row.IsCancelled || false),
        }
      })

      setProgress(50)

      // Insert data in batches to avoid timeouts
      const batchSize = 50
      const batches = []

      for (let i = 0; i < volunteers.length; i += batchSize) {
        batches.push(volunteers.slice(i, i + batchSize))
      }

      let completedBatches = 0

      for (const batch of batches) {
        const { error } = await supabase.from("volunteers_volunteers").insert(batch)

        if (error) throw error

        completedBatches++
        setProgress(50 + Math.floor((completedBatches / batches.length) * 50))
      }

      toast({
        title: "Upload successful",
        description: `${volunteers.length} volunteers have been added to the database.`,
      })

      if (onSuccess) onSuccess()
    } catch (error) {
      console.error("Error uploading Excel file:", error)
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred.",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
      setProgress(0)
      setFile(null)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Volunteer Data</CardTitle>
        <CardDescription>Upload volunteer data from an Excel file (.xlsx or .xls)</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="excel-file">Excel File</Label>
          <Input id="excel-file" type="file" accept=".xlsx,.xls" onChange={handleFileChange} disabled={isUploading} />
        </div>
        {isUploading && (
          <div className="space-y-2">
            <Label>Upload Progress</Label>
            <Progress value={progress} className="h-2" />
            <p className="text-sm text-muted-foreground text-center">{progress}% Complete</p>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={handleUpload} disabled={!file || isUploading} className="w-full">
          {isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Upload Data
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}

