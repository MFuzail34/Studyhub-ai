import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, ArrowRight, Upload, FileText, Download, Sparkles, BookOpen, GraduationCap, X } from "lucide-react";

const CLASSES = ["6", "7", "8", "9", "10"];
const BOARDS = ["SSLC / State Board", "CBSE", "ICSE"];
const SUBJECTS = ["Maths", "Science", "English", "Social Science", "Kannada / Hindi"];
const MARKS_OPTIONS = ["20", "40", "80"];
const DIFFICULTY_OPTIONS = ["Easy", "Medium", "Board Level"];
const PAPER_TYPES = ["Practice Test", "Mock Test", "Unit Test"];

export default function QuestionPaperGenerator() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState(0);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedBoard, setSelectedBoard] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [marks, setMarks] = useState("40");
  const [difficulty, setDifficulty] = useState("Medium");
  const [paperType, setPaperType] = useState("Practice Test");
  const [generatedPaper, setGeneratedPaper] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast({ title: "File too large", description: "Please upload an image under 10MB.", variant: "destructive" });
      return;
    }
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const toBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result.split(",")[1]);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      let imageBase64: string | null = null;
      if (imageFile) {
        imageBase64 = await toBase64(imageFile);
      }

      const { data, error } = await supabase.functions.invoke("generate-paper", {
        body: {
          imageBase64,
          className: selectedClass,
          board: selectedBoard,
          subject: selectedSubject,
          marks,
          difficulty,
          paperType,
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setGeneratedPaper(data.paper);
      setStep(4);
    } catch (err: any) {
      toast({ title: "Generation failed", description: err.message || "Something went wrong.", variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadPDF = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(`
      <html><head><title>Question Paper - Class ${selectedClass} ${selectedSubject}</title>
      <style>body{font-family:serif;padding:40px;line-height:1.8;white-space:pre-wrap;}h1{text-align:center;}</style>
      </head><body>${generatedPaper.replace(/\n/g, "<br/>")}</body></html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const canProceed = () => {
    if (step === 0) return !!selectedClass;
    if (step === 1) return !!selectedBoard;
    if (step === 2) return !!selectedSubject;
    return true;
  };

  const steps = [
    { title: "Select Class", icon: GraduationCap },
    { title: "Board & Subject", icon: BookOpen },
    { title: "Upload Notes", icon: Upload },
    { title: "Paper Settings", icon: FileText },
    { title: "Your Paper", icon: Sparkles },
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
          <Sparkles className="h-3 w-3" /> AI-Powered
        </div>
        <h1 className="text-2xl font-bold tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          Question Paper Generator
        </h1>
        <p className="text-sm text-muted-foreground">Upload your notes and get exam-ready question papers instantly</p>
      </div>

      {/* Progress */}
      <div className="flex items-center justify-center gap-1">
        {steps.map((s, i) => (
          <div key={i} className="flex items-center gap-1">
            <div className={`h-2 w-8 rounded-full transition-colors ${i <= step ? "gradient-primary" : "bg-muted"}`} />
          </div>
        ))}
      </div>

      {/* Step 0: Class Selection */}
      {step === 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2"><GraduationCap className="h-5 w-5 text-primary" /> Select Your Class</CardTitle>
            <CardDescription>Choose your class to get started</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-5 gap-3">
              {CLASSES.map((c) => (
                <button
                  key={c}
                  onClick={() => setSelectedClass(c)}
                  className={`p-4 rounded-xl border-2 text-center font-semibold transition-all ${
                    selectedClass === c
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border hover:border-primary/50 text-foreground"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 1: Board & Subject */}
      {step === 1 && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2"><BookOpen className="h-5 w-5 text-primary" /> Select Board</CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup value={selectedBoard} onValueChange={setSelectedBoard} className="grid grid-cols-1 gap-3">
                {BOARDS.map((b) => (
                  <Label
                    key={b}
                    htmlFor={b}
                    className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      selectedBoard === b ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"
                    }`}
                  >
                    <RadioGroupItem value={b} id={b} />
                    <span className="font-medium">{b}</span>
                  </Label>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Select Subject</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {SUBJECTS.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSelectedSubject(s)}
                    className={`p-3 rounded-xl border-2 text-sm font-medium transition-all ${
                      selectedSubject === s
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border hover:border-primary/50 text-foreground"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Step 2: Upload Notes */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2"><Upload className="h-5 w-5 text-primary" /> Upload Notes</CardTitle>
            <CardDescription>Upload a photo of your notes or textbook page (optional — AI can also generate from syllabus)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            {!imagePreview ? (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-48 border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center gap-3 hover:border-primary/50 hover:bg-primary/5 transition-all text-muted-foreground"
              >
                <Upload className="h-10 w-10" />
                <span className="text-sm font-medium">Tap to upload image</span>
                <span className="text-xs">JPG, PNG up to 10MB</span>
              </button>
            ) : (
              <div className="relative rounded-xl overflow-hidden border border-border">
                <img src={imagePreview} alt="Uploaded notes" className="w-full max-h-64 object-contain bg-muted" />
                <button
                  onClick={removeImage}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 3: Paper Settings */}
      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2"><FileText className="h-5 w-5 text-primary" /> Paper Settings</CardTitle>
            <CardDescription>Customize your question paper</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Total Marks</Label>
              <div className="grid grid-cols-3 gap-3">
                {MARKS_OPTIONS.map((m) => (
                  <button
                    key={m}
                    onClick={() => setMarks(m)}
                    className={`p-3 rounded-xl border-2 font-semibold transition-all ${
                      marks === m ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-primary/50 text-foreground"
                    }`}
                  >
                    {m} Marks
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Difficulty Level</Label>
              <Select value={difficulty} onValueChange={setDifficulty}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {DIFFICULTY_OPTIONS.map((d) => (
                    <SelectItem key={d} value={d}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Paper Type</Label>
              <Select value={paperType} onValueChange={setPaperType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PAPER_TYPES.map((p) => (
                    <SelectItem key={p} value={p}>{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Generated Paper */}
      {step === 4 && generatedPaper && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2"><Sparkles className="h-5 w-5 text-primary" /> Your Question Paper</CardTitle>
            <CardDescription>
              Class {selectedClass} · {selectedBoard} · {selectedSubject} · {marks} Marks · {difficulty}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted/50 rounded-xl p-4 max-h-[60vh] overflow-auto">
              <pre className="whitespace-pre-wrap text-sm leading-relaxed font-sans text-foreground">{generatedPaper}</pre>
            </div>
            <div className="flex gap-3">
              <Button onClick={handleDownloadPDF} className="flex-1 gap-2">
                <Download className="h-4 w-4" /> Download / Print
              </Button>
              <Button
                variant="outline"
                onClick={() => { setGeneratedPaper(""); setStep(0); }}
                className="gap-2"
              >
                Generate Another
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      {step < 4 && (
        <div className="flex gap-3">
          {step > 0 && (
            <Button variant="outline" onClick={() => setStep(step - 1)} className="gap-2">
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
          )}
          <Button
            className="flex-1 gap-2"
            disabled={!canProceed() || isGenerating}
            onClick={() => {
              if (step === 3) {
                handleGenerate();
              } else {
                setStep(step + 1);
              }
            }}
          >
            {step === 3 ? (
              isGenerating ? (
                <>
                  <Sparkles className="h-4 w-4 animate-spin" /> Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" /> Generate Paper
                </>
              )
            ) : (
              <>
                Next <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
