import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  FileText, 
  Upload, 
  Brain, 
  Loader2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Sparkles,
  Target,
  TrendingUp
} from 'lucide-react';

interface SkillMatch {
  skill: string;
  status: 'strong' | 'partial' | 'missing';
  note: string;
}

interface AnalysisResult {
  matchScore: number;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  missingKeywords: string[];
  suggestions: string[];
  keySkillsMatch: SkillMatch[];
}

export function ResumeMatchAnalysis() {
  const [resumeText, setResumeText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isPdf = file.type === 'application/pdf' || file.name.endsWith('.pdf');
    const isTxt = file.type === 'text/plain' || file.name.endsWith('.txt');

    if (!isPdf && !isTxt) {
      toast({
        title: 'Unsupported file type',
        description: 'Please upload a .pdf or .txt file.',
        variant: 'destructive',
      });
      return;
    }

    try {
      if (isTxt) {
        const text = await file.text();
        setResumeText(text);
        setFileName(file.name);
        toast({
          title: 'Resume loaded',
          description: `${file.name} has been loaded successfully.`,
        });
      } else {
        // For PDF, convert to base64 and send to edge function for parsing
        setFileName(file.name);
        const arrayBuffer = await file.arrayBuffer();
        const base64 = btoa(
          new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
        );
        
        toast({
          title: 'Processing PDF...',
          description: 'Extracting text from your resume.',
        });

        const { data, error } = await supabase.functions.invoke('analyze-resume', {
          body: { pdfBase64: base64, action: 'parse-pdf' }
        });

        if (error || data?.error) {
          throw new Error(data?.error || error?.message || 'Failed to parse PDF');
        }

        setResumeText(data.text);
        toast({
          title: 'Resume loaded',
          description: `${file.name} has been parsed successfully.`,
        });
      }
    } catch (error: any) {
      console.error('File upload error:', error);
      toast({
        title: 'Error reading file',
        description: error.message || 'Failed to read the file. Please try again.',
        variant: 'destructive',
      });
      setFileName(null);
    }
  };

  const handleAnalyze = async () => {
    if (!resumeText.trim() || !jobDescription.trim()) {
      toast({
        title: 'Missing information',
        description: 'Please provide both your resume and the job description.',
        variant: 'destructive',
      });
      return;
    }

    setIsAnalyzing(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('analyze-resume', {
        body: { resumeText, jobDescription }
      });

      if (error) {
        throw error;
      }

      if (data.error) {
        throw new Error(data.error);
      }

      setResult(data);
      toast({
        title: 'Analysis complete!',
        description: `Your resume has a ${data.matchScore}% match with this role.`,
      });
    } catch (error: any) {
      console.error('Analysis error:', error);
      toast({
        title: 'Analysis failed',
        description: error.message || 'Failed to analyze resume. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 75) return 'text-success';
    if (score >= 50) return 'text-warning';
    return 'text-destructive';
  };

  const getScoreBackground = (score: number) => {
    if (score >= 75) return 'bg-success';
    if (score >= 50) return 'bg-warning';
    return 'bg-destructive';
  };

  return (
    <div className="space-y-6">
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Resume Input */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-accent" />
              Your Resume
            </CardTitle>
            <CardDescription>
              Upload or paste your resume content
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,.pdf"
              onChange={handleFileUpload}
              className="hidden"
            />
            
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="w-full gap-2"
            >
              <Upload className="h-4 w-4" />
              {fileName ? fileName : 'Upload Resume (.pdf, .txt)'}
            </Button>
            
            <div className="relative">
              <Textarea
                placeholder="Or paste your resume content here..."
                value={resumeText}
                onChange={(e) => {
                  setResumeText(e.target.value);
                  setFileName(null);
                }}
                className="min-h-[200px] resize-none"
              />
              {resumeText && (
                <Badge 
                  variant="secondary" 
                  className="absolute bottom-2 right-2"
                >
                  {resumeText.split(/\s+/).length} words
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Job Description Input */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-accent" />
              Job Description
            </CardTitle>
            <CardDescription>
              Paste the job description you're applying to
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Paste the full job description here..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              className="min-h-[250px] resize-none"
            />
            {jobDescription && (
              <Badge variant="secondary">
                {jobDescription.split(/\s+/).length} words
              </Badge>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Analyze Button */}
      <Button 
        onClick={handleAnalyze}
        disabled={isAnalyzing || !resumeText.trim() || !jobDescription.trim()}
        className="w-full gap-2"
        size="lg"
      >
        {isAnalyzing ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Analyzing with AI...
          </>
        ) : (
          <>
            <Brain className="h-5 w-5" />
            Analyze Match
          </>
        )}
      </Button>

      {/* Results */}
      {result && (
        <div className="space-y-6 animate-fade-in">
          {/* Score Card */}
          <Card className="overflow-hidden">
            <div className={`h-2 ${getScoreBackground(result.matchScore)}`} />
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3">
                    <span className={`text-5xl font-bold ${getScoreColor(result.matchScore)}`}>
                      {result.matchScore}%
                    </span>
                    <div>
                      <p className="font-semibold text-lg">Match Score</p>
                      <p className="text-muted-foreground text-sm">{result.summary}</p>
                    </div>
                  </div>
                </div>
                <Progress 
                  value={result.matchScore} 
                  className="w-full md:w-48 h-3"
                />
              </div>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Strengths */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-success" />
                  Strengths
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {result.strengths.map((strength, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                      {strength}
                    </li>
                  ))}
                  {result.strengths.length === 0 && (
                    <p className="text-muted-foreground text-sm">No specific strengths identified</p>
                  )}
                </ul>
              </CardContent>
            </Card>

            {/* Gaps */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <XCircle className="h-5 w-5 text-destructive" />
                  Gaps to Address
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {result.weaknesses.map((weakness, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <XCircle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                      {weakness}
                    </li>
                  ))}
                  {result.weaknesses.length === 0 && (
                    <p className="text-muted-foreground text-sm">No major gaps identified</p>
                  )}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Missing Keywords */}
          {result.missingKeywords.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-warning" />
                  Missing Keywords
                </CardTitle>
                <CardDescription>
                  Consider adding these terms to your resume
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {result.missingKeywords.map((keyword, i) => (
                    <Badge 
                      key={i} 
                      variant="outline"
                      className="border-warning/50 text-warning"
                    >
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Skills Match */}
          {result.keySkillsMatch.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-accent" />
                  Skills Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {result.keySkillsMatch.map((skill, i) => (
                    <div 
                      key={i} 
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                    >
                      <div className="flex items-center gap-3">
                        {skill.status === 'strong' && (
                          <CheckCircle2 className="h-5 w-5 text-success" />
                        )}
                        {skill.status === 'partial' && (
                          <AlertCircle className="h-5 w-5 text-warning" />
                        )}
                        {skill.status === 'missing' && (
                          <XCircle className="h-5 w-5 text-destructive" />
                        )}
                        <span className="font-medium">{skill.skill}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">{skill.note}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Suggestions */}
          <Card className="border-accent/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-accent" />
                AI Suggestions
              </CardTitle>
              <CardDescription>
                Actionable steps to improve your chances
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {result.suggestions.map((suggestion, i) => (
                  <li 
                    key={i} 
                    className="flex items-start gap-3 p-3 rounded-lg bg-accent/5"
                  >
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-accent/10 text-accent text-sm font-medium flex items-center justify-center">
                      {i + 1}
                    </span>
                    <span className="text-sm">{suggestion}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
