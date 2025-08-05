import React from "react"
import * as Icon1 from "react-icons/bi"
import * as Icon3 from "react-icons/hi2"
import * as Icon2 from "react-icons/io5"

const contactDetails = [
  {
    icon: "HiChatBubbleLeftRight",
    heading: "Chat on us",
    description: "Our friendly team is here to help.",
    details: ["info@beejaacademy.com"],
  },
  {
    icon: "BiWorld",
    heading: "Our Location",
    description: [
      {
        label: "Marketing Office:",
        text: "No.2, 2nd Floor, Gokul Arcade Sardar Patel Road, Adyar, Chennai 600020",
        link: "View on Google Maps",
        url: "https://maps.app.goo.gl/izs9QjGre23YJPoXA",
        iframe: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3938.8665540202246!2d80.23958003308385!3d12.956588031160546!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a525d17a2d0336b%3A0x7e844a0c331cb391!2sBeeja%20Academy!5e1!3m2!1sen!2sin!4v1748981812254!5m2!1sen!2sin"
      },
      {
        label: "Training centre:",
        text: "No 31, Panchayat Main Road, Near Jain Anumitha Apartments, Perungudi, Chennai, Tamil Nadu 600096.",
        link: "View on Google Maps",
        url: "https://maps.app.goo.gl/uwz84s88kipS2MsK7",
        iframe: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3938.078403000359!2d80.2544201751349!3d13.006325287312254!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a5267f3d1715661%3A0x8171b63cf3e5a7af!2sBeeja%20Academy!5e1!3m2!1sen!2sin!4v1748982487813!5m2!1sen!2sin"
      },
    ]
  },
  {
    icon: "IoCall",
    heading: "Call us",
    description: "Mon - Fri From 8am to 5pm",
    details: ["+123 456 7869"],
  },
  {
    icon: "IoPeopleSharp",
    heading: "Partnership Request",
    description: "For partnership and business development inquiries",
    details: ["partner@beejaacademy.com", "8056015925"],
  },
]

const ContactDetails = () => {
  return (
    <div className="flex flex-col gap-6 rounded-xl bg-richblack-800 p-4 lg:p-6">
      {contactDetails.map((ele, i) => {
        let Icon = Icon1[ele.icon] || Icon2[ele.icon] || Icon3[ele.icon]
        return (
          <div
            className="flex flex-col gap-[2px] p-3 text-sm text-richblack-200"
            key={i}
          >
            <div className="flex flex-row items-center gap-3">
              <Icon size={25} />
              <h1 className="text-lg font-semibold text-richblack-5">
                {ele?.heading}
              </h1>
            </div>

            {Array.isArray(ele.description) ? (
              <div className="flex flex-col gap-4">
                {ele.description.map((item, idx) => (
                  <div key={idx} className="flex flex-col gap-2">
                    <div>
                      <p className="font-medium">{item.label}</p>
                      <p className="font-semibold">{item.text}</p>
                      {item.link && (
                        <a 
                          href={item.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-yellow-100 underline text-sm"
                        >
                          {item.link}
                        </a>
                      )}
                    </div>
                    {item.iframe && (
                      <div className="w-full h-[200px] rounded-lg overflow-hidden mt-2">
                        <iframe
                          src={item.iframe}
                          width="100%"
                          height="100%"
                          style={{ border: 0 }}
                          allowFullScreen
                          loading="lazy"
                          referrerPolicy="no-referrer-when-downgrade"
                          className="rounded-lg"
                        ></iframe>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <>
                <p className="font-medium">{ele?.description}</p>
                {Array.isArray(ele.details) ? (
                  <div className="flex flex-col">
                    {ele.details.map((detail, idx) => (
                      <p key={idx} className="font-semibold">
                        {detail}
                      </p>
                    ))}
                  </div>
                ) : (
                  <p className="font-semibold">{ele.details}</p>
                )}
              </>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default ContactDetails