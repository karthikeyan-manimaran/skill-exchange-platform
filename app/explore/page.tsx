"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { AppLayout } from "@/components/app-layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useToast } from "@/components/ui/use-toast"
import { updateUserProfile, getUserProfile } from "@/lib/firebase/firestore"
import type { UserProfile } from "@/lib/types"

export default function ExplorePage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [skills, setSkills] = useState<any[]>([])
  const [filteredSkills, setFilteredSkills] = useState<any[]>([])
  const [selectedSkill, setSelectedSkill] = useState<any>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterCategory, setFilterCategory] = useState("all")
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)

  useEffect(() => {
    // Fetch user profile
    const fetchUserProfile = async () => {
      if (user) {
        try {
          const profile = await getUserProfile(user.uid)
          setUserProfile(profile)
        } catch (error) {
          console.error("Error fetching user profile:", error)
        }
      }
    }

    fetchUserProfile()

    // Simulate loading skills
    const timer = setTimeout(() => {
      const skillsData = [
        {
          id: 1,
          title: "Web Development",
          description: "Learn HTML, CSS, and JavaScript from an experienced developer",
          longDescription:
            "This comprehensive course covers everything from basic HTML and CSS to advanced JavaScript concepts. You'll learn how to build responsive websites, work with modern frameworks like React, and deploy your applications to the web. Perfect for beginners and intermediate developers looking to level up their skills.",
          instructor: "Alex Johnson",
          instructorBio:
            "Full-stack developer with 8+ years of experience. Passionate about teaching and helping others learn to code.",
          rating: 4.8,
          category: "technology",
          topics: ["HTML", "CSS", "JavaScript", "React", "Responsive Design"],
          prerequisites: ["Basic computer skills", "No prior coding experience required"],
          duration: "8 weeks",
          sessions: 16,
        },
        {
          id: 2,
          title: "Digital Marketing",
          description: "Master SEO, social media marketing, and content strategy",
          longDescription:
            "Dive into the world of digital marketing with this hands-on course. You'll learn proven strategies for search engine optimization, social media marketing, content creation, and analytics. By the end of the course, you'll be able to create and execute effective digital marketing campaigns for any business.",
          instructor: "Sarah Williams",
          instructorBio:
            "Digital marketing specialist with experience working with Fortune 500 companies. Google and Facebook ads certified.",
          rating: 4.6,
          category: "business",
          topics: ["SEO", "Social Media Marketing", "Content Strategy", "Google Analytics", "Email Marketing"],
          prerequisites: ["Basic understanding of marketing concepts", "Familiarity with social media platforms"],
          duration: "6 weeks",
          sessions: 12,
        },
        {
          id: 3,
          title: "Graphic Design",
          description: "Learn design principles and tools like Photoshop and Illustrator",
          longDescription:
            "Develop your creative skills with this comprehensive graphic design course. You'll learn fundamental design principles, color theory, typography, and how to use industry-standard tools like Adobe Photoshop and Illustrator. Create stunning visuals for print and digital media while building a professional portfolio.",
          instructor: "Michael Chen",
          instructorBio:
            "Award-winning graphic designer with over a decade of experience in branding and digital design.",
          rating: 4.9,
          category: "arts",
          topics: ["Design Principles", "Adobe Photoshop", "Adobe Illustrator", "Typography", "Branding"],
          prerequisites: ["No prior design experience required", "Access to Adobe Creative Cloud recommended"],
          duration: "10 weeks",
          sessions: 20,
        },
        {
          id: 4,
          title: "Photography Basics",
          description: "Master composition, lighting, and camera settings",
          longDescription:
            "Learn the art and science of photography in this hands-on course. You'll master camera settings, composition techniques, lighting principles, and post-processing workflows. Whether you're using a DSLR, mirrorless camera, or even a smartphone, you'll develop the skills to capture stunning images in any situation.",
          instructor: "Emma Rodriguez",
          instructorBio:
            "Professional photographer specializing in portrait and landscape photography. Published in National Geographic.",
          rating: 4.7,
          category: "arts",
          topics: ["Camera Settings", "Composition", "Lighting", "Post-Processing", "Photo Editing"],
          prerequisites: ["Access to any camera (DSLR, mirrorless, or smartphone)"],
          duration: "6 weeks",
          sessions: 12,
        },
        {
          id: 5,
          title: "Data Science",
          description: "Learn Python, statistics, and machine learning fundamentals",
          longDescription:
            "Dive into the world of data science with this comprehensive course. You'll learn Python programming, statistical analysis, data visualization, and machine learning algorithms. Work on real-world projects and develop the skills needed to extract insights from complex datasets and build predictive models.",
          instructor: "David Kim",
          instructorBio: "Data scientist with a PhD in Computer Science and experience at leading tech companies.",
          rating: 4.8,
          category: "technology",
          topics: ["Python", "Statistics", "Data Visualization", "Machine Learning", "Data Analysis"],
          prerequisites: ["Basic programming knowledge helpful but not required", "High school level math"],
          duration: "12 weeks",
          sessions: 24,
        },
        {
          id: 6,
          title: "Mobile App Development",
          description: "Build iOS and Android apps with React Native",
          longDescription:
            "Learn to build cross-platform mobile applications using React Native. This course covers everything from setting up your development environment to publishing your apps on the App Store and Google Play. You'll build several complete applications while learning best practices for mobile UI/UX design and performance optimization.",
          instructor: "Jessica Lee",
          instructorBio: "Mobile app developer who has launched over 20 apps with millions of downloads.",
          rating: 4.5,
          category: "technology",
          topics: ["React Native", "JavaScript", "Mobile UI/UX", "App Publishing", "API Integration"],
          prerequisites: ["Basic JavaScript knowledge", "Familiarity with React is helpful but not required"],
          duration: "10 weeks",
          sessions: 20,
        },
      ]

      setSkills(skillsData)
      setFilteredSkills(skillsData)
      setIsLoading(false)
    }, 1500)

    return () => clearTimeout(timer)
  }, [user])

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    filterSkills(query, filterCategory)
  }

  const handleCategoryChange = (category: string) => {
    setFilterCategory(category)
    filterSkills(searchQuery, category)
  }

  const filterSkills = (query: string, category: string) => {
    const filtered = skills.filter((skill) => {
      const matchesSearch =
        skill.title.toLowerCase().includes(query.toLowerCase()) ||
        skill.description.toLowerCase().includes(query.toLowerCase()) ||
        skill.instructor.toLowerCase().includes(query.toLowerCase())

      const matchesCategory = category === "all" || skill.category === category

      return matchesSearch && matchesCategory
    })

    setFilteredSkills(filtered)
  }

  const handleViewDetails = (skill: any) => {
    setSelectedSkill(skill)
    // Scroll to the details section
    setTimeout(() => {
      document.getElementById("skill-details")?.scrollIntoView({ behavior: "smooth" })
    }, 100)
  }

  const handleCloseDetails = () => {
    setSelectedSkill(null)
  }

  const handleAddToWanted = async (skill: any) => {
    if (!user || !userProfile) {
      toast({
        title: "Authentication required",
        description: "Please login to add skills to your profile.",
        variant: "destructive",
      })
      return
    }

    try {
      // Check if skill is already in wanted skills
      if (userProfile.skillsWanted.includes(skill.title)) {
        toast({
          title: "Skill already added",
          description: `${skill.title} is already in your wanted skills.`,
        })
        return
      }

      // Add skill to wanted skills
      const updatedSkills = [...userProfile.skillsWanted, skill.title]
      await updateUserProfile(user.uid, {
        skillsWanted: updatedSkills,
      })

      // Update local state
      setUserProfile({
        ...userProfile,
        skillsWanted: updatedSkills,
      })

      toast({
        title: "Skill added",
        description: `${skill.title} has been added to your wanted skills.`,
      })
    } catch (error) {
      console.error("Error adding skill:", error)
      toast({
        title: "Failed to add skill",
        description: "Please try again later.",
        variant: "destructive",
      })
    }
  }

  return (
    <AppLayout showSearch={true} searchPlaceholder="Search skills..." onSearch={handleSearch}>
      <div className="space-y-6">
        <div className="flex flex-col space-y-4">
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Explore Skills
          </h1>
          <p className="text-muted-foreground">
            Browse our collection of skills and find the perfect match for your learning journey.
          </p>
        </div>

        <Tabs defaultValue="all" onValueChange={handleCategoryChange}>
          <TabsList className="bg-muted/50 backdrop-blur-sm">
            <TabsTrigger
              value="all"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-accent data-[state=active]:text-primary-foreground"
            >
              All
            </TabsTrigger>
            <TabsTrigger
              value="technology"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-accent data-[state=active]:text-primary-foreground"
            >
              Technology
            </TabsTrigger>
            <TabsTrigger
              value="business"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-accent data-[state=active]:text-primary-foreground"
            >
              Business
            </TabsTrigger>
            <TabsTrigger
              value="arts"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-accent data-[state=active]:text-primary-foreground"
            >
              Arts
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array(6)
              .fill(0)
              .map((_, index) => (
                <Card key={index} className="animate-pulse">
                  <CardHeader className="space-y-2">
                    <div className="h-6 w-3/4 bg-muted rounded"></div>
                    <div className="h-4 w-1/2 bg-muted rounded"></div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="h-4 w-full bg-muted rounded"></div>
                    <div className="h-4 w-full bg-muted rounded"></div>
                    <div className="h-4 w-2/3 bg-muted rounded"></div>
                  </CardContent>
                  <CardFooter>
                    <div className="h-10 w-full bg-muted rounded"></div>
                  </CardFooter>
                </Card>
              ))}
          </div>
        ) : (
          <>
            {filteredSkills.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredSkills.map((skill) => (
                  <Card
                    key={skill.id}
                    className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-fade-up bg-card"
                  >
                    <CardHeader>
                      <CardTitle className="text-xl bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                        {skill.title}
                      </CardTitle>
                      <CardDescription className="flex items-center justify-between">
                        <span>{skill.instructor}</span>
                        <Badge variant="outline" className="ml-2">
                          ★ {skill.rating}
                        </Badge>
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-foreground mb-4">{skill.description}</p>
                      <div className="flex flex-wrap gap-1 mb-2">
                        {skill.topics.slice(0, 3).map((topic: string, index: number) => (
                          <Badge key={index} variant="secondary" className="bg-muted text-foreground">
                            {topic}
                          </Badge>
                        ))}
                        {skill.topics.length > 3 && (
                          <Badge variant="secondary" className="bg-muted text-foreground">
                            +{skill.topics.length - 3} more
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground mt-2">
                        <span>{skill.duration}</span>
                        <span>{skill.sessions} sessions</span>
                      </div>
                    </CardContent>
                    <CardFooter className="flex gap-2">
                      <Button
                        variant="outline"
                        className="w-1/2 hover:bg-muted transition-all duration-300"
                        onClick={() => handleViewDetails(skill)}
                      >
                        Details
                      </Button>
                      <Button
                        className="w-1/2 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 transition-all duration-300"
                        onClick={() => handleAddToWanted(skill)}
                      >
                        Learn
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-card rounded-xl">
                <div className="text-5xl mb-4">🔍</div>
                <h2 className="text-2xl font-bold mb-2">No skills found</h2>
                <p className="text-muted-foreground max-w-md mx-auto">
                  We couldn't find any skills matching your search criteria. Try adjusting your filters or search query.
                </p>
              </div>
            )}

            {selectedSkill && (
              <div id="skill-details" className="mt-12 bg-card rounded-xl border shadow-lg p-6 animate-fade-up">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    {selectedSkill.title}
                  </h2>
                  <Button variant="ghost" size="sm" onClick={handleCloseDetails}>
                    ×
                  </Button>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                  <div className="md:col-span-2 space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Description</h3>
                      <p className="text-foreground">{selectedSkill.longDescription}</p>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-2">Topics Covered</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedSkill.topics.map((topic: string, index: number) => (
                          <Badge key={index} className="bg-muted text-foreground">
                            {topic}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-2">Prerequisites</h3>
                      <ul className="list-disc list-inside space-y-1 text-foreground">
                        {selectedSkill.prerequisites.map((prerequisite: string, index: number) => (
                          <li key={index}>{prerequisite}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="bg-muted p-4 rounded-lg">
                      <h3 className="text-lg font-semibold mb-4">About the Instructor</h3>
                      <div className="flex items-center gap-3 mb-3">
                        <Avatar className="h-12 w-12 border-2 border-primary">
                          <AvatarFallback className="bg-gradient-to-r from-primary to-accent text-primary-foreground">
                            {selectedSkill.instructor.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{selectedSkill.instructor}</div>
                          <div className="text-sm text-muted-foreground">★ {selectedSkill.rating} Rating</div>
                        </div>
                      </div>
                      <p className="text-sm text-foreground">{selectedSkill.instructorBio}</p>
                    </div>

                    <div className="bg-muted p-4 rounded-lg">
                      <h3 className="text-lg font-semibold mb-2">Course Details</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Duration:</span>
                          <span className="font-medium">{selectedSkill.duration}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Sessions:</span>
                          <span className="font-medium">{selectedSkill.sessions}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Category:</span>
                          <span className="font-medium capitalize">{selectedSkill.category}</span>
                        </div>
                      </div>
                    </div>

                    <Button
                      className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 transition-all duration-300"
                      onClick={() => handleAddToWanted(selectedSkill)}
                    >
                      Add to My Learning Goals
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </AppLayout>
  )
}

