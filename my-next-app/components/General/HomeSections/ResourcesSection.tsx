import React, { useState } from "react";
import { professionalPDFContent, getFileName, getSuccessMessage } from "../cancerGuide";
import {
  FileText,
  Video,
  Download,
  PlayCircle,
  X,
  Youtube,
  ExternalLink,
  Users,
  Clock,
  Stethoscope
} from "lucide-react";

export default function ResourcesSection({ addToRefs }: { addToRefs: (el: HTMLElement | null) => void }) {
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [showLiveSessionModal, setShowLiveSessionModal] = useState(false);
  const [downloadedResources, setDownloadedResources] = useState<Set<string>>(new Set());
  const [pdfBlobs, setPdfBlobs] = useState<Record<string, string>>({});

  const handleDownloadGuide = async (resourceType = "blood-cancer-guide") => {
    const resourceId = resourceType;

    if (downloadedResources.has(resourceId)) {
      alert("📚 You have already downloaded this guide. Check your downloads folder.");
      return;
    }

    setDownloadedResources((prev) => new Set(prev).add(resourceId));

    const { default: jsPDF } = await import("jspdf");
    const doc = new jsPDF();

    let yPosition = 20;
    const margin = 20;
    const pageHeight = doc.internal.pageSize.height;

    // Add professional header
    doc.setFillColor(10, 30, 60);
    doc.rect(0, 0, 210, 15, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("HEMA AI - CONFIDENTIAL MEDICAL DOCUMENT", 105, 10, { align: "center" });

    doc.setTextColor(0, 0, 0);
    yPosition = 25;

    // Use imported professional content
    (professionalPDFContent as Record<string, any[]>)[resourceType].forEach((section, index) => {
      // Check for page break
      if (yPosition > pageHeight - 40) {
        doc.addPage();
        yPosition = 20;
      }

      if (section.title) {
        doc.setFontSize(section.fontSize);
        doc.setTextColor(section.color[0], section.color[1], section.color[2]);
        doc.setFont("helvetica", "bold");

        // Center the main title
        if (section.isTitle) {
          doc.text(section.title, 105, yPosition, { align: "center" });
          yPosition += 10;
        } else {
          doc.text(section.title, margin, yPosition);
          yPosition += 8;
        }
      }

      if (section.body) {
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        doc.setFont("helvetica", "normal");

        const bodyLines = doc.splitTextToSize(section.body, 170);
        doc.text(bodyLines, margin, yPosition);
        yPosition += bodyLines.length * 6 + 12;
      }

      // Add section separator for non-title sections
      if (!section.isTitle && index < (professionalPDFContent as Record<string, any[]>)[resourceType].length - 1) {
        doc.setDrawColor(200, 200, 200);
        doc.line(margin, yPosition, 210 - margin, yPosition);
        yPosition += 15;
      }
    });

    // Add professional footer
    doc.setFontSize(8);
    doc.setTextColor(100);
    doc.text(
      "This document contains proprietary medical information developed by HemaAI Healthcare Technologies.",
      margin,
      pageHeight - 25
    );
    doc.text(
      "For medical decisions, consult qualified healthcare professionals. Content based on current medical evidence.",
      margin,
      pageHeight - 20
    );
    doc.text(
      `HemaAI Healthcare Technologies © ${new Date().getFullYear()} | www.hemaai.com | +92 300 123 4567`,
      105,
      pageHeight - 10,
      { align: "center" }
    );

    // Save PDF for download
    const fileName = getFileName(resourceType);
    doc.save(fileName);

    // Save PDF blob for viewing
    const pdfBlob = doc.output("blob");
    const pdfUrl = URL.createObjectURL(pdfBlob);
    setPdfBlobs((prev) => ({ ...prev, [resourceType]: pdfUrl }));

    // Show professional success message
    alert(getSuccessMessage(resourceType));
  };

  const handlePlayVideo = () => {
    setShowVideoModal(true);
  };

  const handleJoinSession = () => {
    setShowLiveSessionModal(true);
  };

  const liveSessions = [
    {
      id: 1,
      title: "Coping with Chemotherapy",
      time: "Saturday 10:00 AM",
      expert: "Dr. Sarah Khan",
      description: "Learn strategies to manage side effects and maintain quality of life during treatment."
    },
    {
      id: 2,
      title: "Nutrition During Treatment",
      time: "Sunday 3:00 PM",
      expert: "Nutritionist Ayesha",
      description: "Dietary guidelines to support your body through cancer treatment and recovery."
    },
    {
      id: 3,
      title: "Family Support Strategies",
      time: "Friday 6:00 PM",
      expert: "Psychologist Dr. Ali",
      description: "How families can provide emotional support while taking care of their own wellbeing."
    }
  ];

  const educationalResources = [
    {
      icon: FileText,
      title: "Blood Cancer Guide",
      description: "Complete guide to understanding symptoms, diagnosis, and treatment options",
      type: "PDF Guide",
      action: () => handleDownloadGuide("blood-cancer-guide"),
      buttonText: "Download Guide",
      buttonIcon: Download,
      disabled: downloadedResources.has("blood-cancer-guide"),
      pages: undefined,
      duration: undefined,
      schedule: undefined
    },
    {
      icon: Video,
      title: "Early Detection Webinar",
      description: "Learn how AI is revolutionizing early cancer detection in Pakistan",
      type: "Video",
      action: handlePlayVideo,
      buttonText: "Watch Video",
      buttonIcon: PlayCircle,
      disabled: false,
      pages: undefined,
      duration: "45 mins",
      schedule: undefined
    },
    {
      icon: FileText,
      title: "Treatment Options",
      description: "Comprehensive overview of available treatments and therapies",
      type: "PDF Guide",
      action: () => handleDownloadGuide("treatment-options"),
      buttonText: "Download Guide",
      buttonIcon: Download,
      disabled: downloadedResources.has("treatment-options"),
      pages: undefined,
      duration: undefined,
      schedule: undefined
    }
  ];

  return (
    <>
      {/* Video Modal */}
      {showVideoModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-xl font-bold text-gray-900">Blood Cancer Awareness & Motivation</h3>
              <button
                onClick={() => setShowVideoModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="aspect-video bg-gray-900">
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center text-white p-8">
                  <div className="w-24 h-24 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                    <PlayCircle className="w-12 h-12" />
                  </div>
                  <h4 className="text-2xl font-bold mb-4">Blood Cancer: Hope & Healing</h4>
                  <p className="text-lg mb-6 opacity-90 max-w-2xl">
                    Watch inspiring stories of survivors and learn about the latest advancements in blood cancer treatment.
                  </p>

                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                      onClick={() => window.open('https://www.youtube.com/results?search_query=blood+cancer+survivor+stories+motivation', '_blank')}
                      className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-full font-semibold transition-colors flex items-center gap-2"
                    >
                      <Youtube className="w-5 h-5" />
                      Watch Survivor Stories
                    </button>
                    <button
                      onClick={() => window.open('https://www.youtube.com/results?search_query=blood+cancer+treatment+advancements', '_blank')}
                      className="border border-white hover:bg-white hover:text-gray-900 text-white px-6 py-3 rounded-full font-semibold transition-colors flex items-center gap-2"
                    >
                      <Video className="w-5 h-5" />
                      Medical Advances
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Live Session Modal */}
      {showLiveSessionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-2xl font-bold text-gray-900">Join Support Group Sessions</h3>
              <button
                onClick={() => setShowLiveSessionModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                <div className="flex items-center gap-3">
                  <Users className="w-6 h-6 text-blue-600" />
                  <div>
                    <h4 className="font-semibold text-blue-900 mb-1">Weekly Virtual Meetings</h4>
                    <p className="text-blue-700 text-sm">
                      Connect with patients, caregivers, and healthcare professionals in our supportive community.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <h4 className="font-bold text-gray-900 text-lg">Upcoming Sessions</h4>
                {liveSessions.map((session) => (
                  <div key={session.id} className="border border-gray-200 rounded-xl p-4 hover:border-blue-300 transition-colors group">
                    <div className="flex justify-between items-start mb-3">
                      <h5 className="font-semibold text-gray-900 text-lg group-hover:text-blue-600 transition-colors">
                        {session.title}
                      </h5>
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
                        Upcoming
                      </span>
                    </div>

                    <p className="text-gray-600 mb-3 text-sm leading-relaxed">
                      {session.description}
                    </p>

                    <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {session.time}
                        </span>
                        <span className="flex items-center gap-1">
                          <Stethoscope className="w-4 h-4" />
                          {session.expert}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        alert(`🎉 Successfully registered for:\n\n"${session.title}"\n\n📅 ${session.time}\n👨⚕️ Hosted by: ${session.expert}\n\n💌 Meeting details will be sent to your email 1 hour before the session.\n\nWe look forward to seeing you there!`);
                        setShowLiveSessionModal(false);
                      }}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition-colors transform hover:scale-105 duration-200"
                    >
                      Register for This Session
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Resources & Education with Professional PDF Download */}
      <section className="py-20 bg-gradient-to-br from-green-50 to-blue-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div
            ref={addToRefs}
            className="text-center mb-16 transform transition-all duration-700 opacity-0 translate-y-8"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Medical <span className="text-blue-600 animate-pulse animate-pulse">Resources</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive blood cancer resources developed by medical professionals for patients, families, and healthcare providers
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {educationalResources.map((resource, index) => (
              <div
                key={index}
                ref={addToRefs}
                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-gray-100 group"
              >
                <div className="flex items-center mb-4">
                  <div className={`w-12 h-12 ${resource.buttonIcon === Download ? "bg-blue-100" :
                    resource.buttonIcon === PlayCircle ? "bg-red-100" : "bg-green-100"
                    } rounded-lg flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300`}>
                    <resource.icon className={`w-6 h-6 ${resource.buttonIcon === Download ? "text-blue-600" :
                      resource.buttonIcon === PlayCircle ? "text-red-600" : "text-green-600"
                      }`} />
                  </div>
                  <div>
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${resource.buttonIcon === Download ? "bg-blue-100 text-blue-600" :
                      resource.buttonIcon === PlayCircle ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"
                      }`}>
                      {resource.type}
                    </span>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-3">{resource.title}</h3>
                <p className="text-gray-600 mb-4 leading-relaxed">{resource.description}</p>

                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm text-gray-500">
                    {resource.pages || resource.duration || resource.schedule}
                  </span>

                  {/* Buttons */}
                  <div className="flex gap-2">
                    {/* Download PDF */}
                    {resource.type === "PDF Guide" && (
                      <button
                        onClick={resource.action}
                        disabled={resource.disabled}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full font-semibold text-sm ${resource.disabled
                          ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                          : "bg-blue-600 text-white hover:bg-blue-700"
                          } transition-all duration-300 transform hover:scale-105 disabled:hover:scale-100`}
                      >
                        <resource.buttonIcon className="w-4 h-4" />
                        {resource.disabled ? "Downloaded" : resource.buttonText}
                      </button>
                    )}

                    {/* View PDF */}
                    {resource.type === "PDF Guide" && (
                      <button
                        onClick={() => {
                          const resourceIdMap: Record<string, string> = {
                            "Blood Cancer Guide": "blood-cancer-guide",
                            "Patient Resources": "patient-resources",
                            "Treatment Options": "treatment-options"
                          };
                          const key = resourceIdMap[resource.title];
                          if (pdfBlobs[key]) {
                            window.open(pdfBlobs[key], "_blank");
                          } else {
                            resource.action();
                            setTimeout(() => {
                              if (pdfBlobs[key]) window.open(pdfBlobs[key], "_blank");
                            }, 500);
                          }
                        }}
                        className="flex items-center gap-2 px-4 py-2 rounded-full font-semibold text-sm bg-green-600 text-white hover:bg-green-700 transition-all duration-300 transform hover:scale-105"
                      >
                        <ExternalLink className="w-4 h-4" />
                        View
                      </button>
                    )}

                    {/* Video / Live Session button */}
                    {resource.type !== "PDF Guide" && (
                      <button
                        onClick={resource.action}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full font-semibold text-sm ${resource.buttonIcon === PlayCircle
                          ? "bg-red-600 text-white hover:bg-red-700"
                          : "bg-green-600 text-white hover:bg-green-700"
                          } transition-all duration-300 transform hover:scale-105`}
                      >
                        <resource.buttonIcon className="w-4 h-4" />
                        {resource.buttonText}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
