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

interface VolunteerData {
  serial_number?: string;
  full_name?: string;
  age?: number | null;
  aadhar_number?: string;
  sai_connect_id?: string;
  sevadal_training_certificate: boolean;
  mobile_number?: string;
  sss_district?: string;
  samiti_or_bhajan_mandli?: string;
  education?: string;
  special_qualifications?: string;
  past_prashanti_service: boolean;
  last_service_location?: string;
  other_service_location?: string;
  prashanti_arrival?: string | null;
  prashanti_departure?: string | null;
  duty_point?: string;
  is_cancelled: boolean;
  [key: string]: any; // Allow dynamic string keys
}

// Header mapping for both English and Hindi
const headerMapping: { [key: string]: string } = {
  // English headers
  "serial number": "serial_number",
  "full name": "full_name",
  "age": "age",
  "aadhar number": "aadhar_number",
  "sai connect id": "sai_connect_id",
  "sevadal training certificate": "sevadal_training_certificate",
  "mobile number": "mobile_number",
  "sss district": "sss_district",
  "samiti or bhajan mandli": "samiti_or_bhajan_mandli",
  "education": "education",
  "special qualifications": "special_qualifications",
  "past prashanti service": "past_prashanti_service",
  "last service location": "last_service_location",
  "other service location": "other_service_location",
  "prashanti arrival": "prashanti_arrival",
  "prashanti departure": "prashanti_departure",
  "duty point": "duty_point",
  "is cancelled": "is_cancelled",
  
  // Hindi headers (add your Hindi translations here)
  "क्रम संख्या": "serial_number",
  "पूरा नाम": "full_name",
  "आयु": "age",
  "आधार नंबर": "aadhar_number",
  "साई कनेक्ट आईडी": "sai_connect_id",
  "सेवादल प्रशिक्षण प्रमाणपत्र": "sevadal_training_certificate",
  "मोबाइल नंबर": "mobile_number",
  "एसएसएस जिला": "sss_district",
  "समिति या भजन मंडली": "samiti_or_bhajan_mandli",
  "शिक्षा": "education",
  "विशेष योग्यता": "special_qualifications",
  "पूर्व प्रशांति सेवा": "past_prashanti_service",
  "अंतिम सेवा स्थान": "last_service_location",
  "अन्य सेवा स्थान": "other_service_location",
  "प्रशांति आगमन": "prashanti_arrival",
  "प्रशांति प्रस्थान": "prashanti_departure",
  "ड्यूटी पॉइंट": "duty_point",
  "रद्द किया गया": "is_cancelled",
}

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

  const normalizeHeader = (header: string): string => {
    const normalized = header.toLowerCase().trim()
    return headerMapping[normalized] || normalized
  }

  const parseBoolean = (value: any): boolean => {
    if (typeof value === 'boolean') return value
    if (typeof value === 'string') {
      const lowered = value.toLowerCase().trim()
      return lowered === 'yes' || lowered === 'true' || lowered === 'हाँ' || lowered === '1'
    }
    return Boolean(value)
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

    const fileExt = file.name.split('.').pop()?.toLowerCase()
    if (!['xlsx', 'xls', 'csv'].includes(fileExt || '')) {
      toast({
        title: "Invalid file format",
        description: "Please upload an Excel or CSV file (.xlsx, .xls, or .csv).",
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)
    setProgress(10)

    try {
      // Read the file
      const data = await file.arrayBuffer()
      const workbook = XLSX.read(data)
      const worksheet = workbook.Sheets[workbook.SheetNames[0]]
      const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as unknown[][]

      if (rawData.length < 2) {
        throw new Error("File is empty or contains only headers")
      }

      // Get and normalize headers
      const headers = (rawData[0] as string[]).map(header => normalizeHeader(header))
      const rows = rawData.slice(1) as unknown[][]

      setProgress(30)

      // Map data to our schema
      const volunteers = rows.map((row) => {
        const volunteer: Partial<VolunteerData> = {
          sevadal_training_certificate: false,
          past_prashanti_service: false,
          is_cancelled: false
        }
        headers.forEach((header: string, index) => {
          if (row[index] !== undefined && row[index] !== null) {
            switch (header) {
              case 'age':
                volunteer.age = parseInt(String(row[index])) || null
                break
              case 'sevadal_training_certificate':
              case 'past_prashanti_service':
              case 'is_cancelled':
                (volunteer as any)[header] = parseBoolean(row[index])
                break
              case 'prashanti_arrival':
              case 'prashanti_departure':
                const dateValue = XLSX.SSF.parse_date_code(Number(row[index]))
                if (dateValue) {
                  (volunteer as any)[header] = new Date(dateValue.y, dateValue.m - 1, dateValue.d).toISOString()
                } else {
                  (volunteer as any)[header] = null
                }
                break
              default:
                (volunteer as any)[header] = String(row[index]).trim()
            }
          }
        })
        return volunteer
      }).filter(v => Object.keys(v).length > 0) // Remove empty rows

      setProgress(50)

      // Insert data in batches
      const batchSize = 50
      const batches = []
      for (let i = 0; i < volunteers.length; i += batchSize) {
        batches.push(volunteers.slice(i, i + batchSize))
      }

      let completedBatches = 0
      for (const batch of batches) {
        const { error } = await supabase
          .from("volunteers_volunteers")
          .insert(batch.map(volunteer => ({
            ...volunteer,
            sevadal_training_certificate: volunteer.sevadal_training_certificate ?? false,
            past_prashanti_service: volunteer.past_prashanti_service ?? false,
            is_cancelled: volunteer.is_cancelled ?? false
          })))

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
      console.error("Error uploading file:", error)
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred.",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
      setProgress(0)
      setFile(null)
      // Reset the file input
      const fileInput = document.getElementById('excel-file') as HTMLInputElement
      if (fileInput) fileInput.value = ''
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Volunteer Data</CardTitle>
        <CardDescription>Upload volunteer data from Excel (.xlsx, .xls) or CSV files</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="excel-file">Select File</Label>
          <Input 
            id="excel-file" 
            type="file" 
            accept=".xlsx,.xls,.csv" 
            onChange={handleFileChange} 
            disabled={isUploading} 
          />
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

