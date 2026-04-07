#!/usr/bin/env python3
from __future__ import annotations

from pathlib import Path

from docx import Document


TEMPLATE = Path(r"c:\Users\Mohamed Daoud\Downloads\Application Form - LSA_ILSA_HLLSA (1).docx")
OUTPUT_DOCX = Path(r"c:\Users\Mohamed Daoud\Desktop\suraga-website\public\JESS_Application_Suraga_Elzibaer_Filled_2026.docx")
OUTPUT_PDF = OUTPUT_DOCX.with_suffix(".pdf")
SIGN_DATE = "03/04/2026"


def set_cell(cell, text: str) -> None:
    cell.text = text


def fill_docx() -> Path:
    doc = Document(str(TEMPLATE))
    tables = doc.tables

    # Part 1 - Personal details
    t0 = tables[0]
    set_cell(t0.rows[1].cells[0], "Position applied for:\n1:1 Learning Support Assistant\n\nSchool:\nJESS Arabian Ranches Primary")
    set_cell(t0.rows[1].cells[1], "Title:\n\n☒ Mr.  ☐ Ms.  ☐ Mrs.  ☐ Dr.")
    set_cell(t0.rows[1].cells[3], "Full Name (as per passport):\nSuraga Mohamed Daoud Elzibaer")
    set_cell(t0.rows[2].cells[0], "Preferred name:\nSuraga")
    set_cell(t0.rows[2].cells[1], "Maiden Name:\nN/A")
    set_cell(t0.rows[2].cells[3], "List other names you have been known by or use in the past or alias names:\nNone")
    set_cell(t0.rows[3].cells[0], "Gender:\n☒ Male           ☐ Female")
    set_cell(t0.rows[3].cells[1], "Date of birth:\n25/12/1998\nAge:\n27")
    set_cell(t0.rows[3].cells[3], "Place of birth (City/Country):\nKhartoum, Sudan")
    set_cell(t0.rows[4].cells[0], "Nationality:\nSudanese")
    set_cell(t0.rows[4].cells[1], "Marital status:\nSingle")
    set_cell(t0.rows[4].cells[3], "Religion:\nIslam")
    set_cell(
        t0.rows[5].cells[0],
        "Telephone Numbers:\nHome: N/A\nMobile: +971 55 717 7083\nWork: N/A\nHome Country: N/A",
    )
    set_cell(
        t0.rows[5].cells[2],
        "Email addresses:\n\nPersonal:\nsuragaelzibaer@gmail.com\nWork:\nN/A",
    )
    set_cell(t0.rows[6].cells[2], "NI Number:\nN/A - international applicant")
    set_cell(t0.rows[7].cells[0], "Full residential address in UAE:\nDubai, United Arab Emirates")
    set_cell(t0.rows[7].cells[1], "Home Country address:\nKhartoum, Sudan")
    set_cell(t0.rows[7].cells[3], "Home International Airport:\nKhartoum International Airport")

    t2 = tables[2]
    set_cell(t2.rows[0].cells[0], "Country issuing Passport:\nSudan")
    set_cell(t2.rows[0].cells[1], "Passport No:\nP13333217")
    set_cell(t2.rows[0].cells[2], "Passport Expiry Date:\n24/02/2035")
    set_cell(t2.rows[1].cells[0], "Emirates ID number:\nRedacted in the provided copy - please insert from the original EID if required.")
    set_cell(
        t2.rows[1].cells[1],
        "Sponsorship Status:\n\n"
        "☐ Husband's visa\n"
        "☐ Employer's visa\n"
        "☐ Golden visa\n"
        "☐ Mother/Father's visa\n"
        "☐ Tourist/on arrival visa\n"
        "☒ Other - Sponsor of Wars and Disasters Nationals",
    )
    set_cell(t2.rows[1].cells[2], "List any other Citizenships or passports held in your name or any alias or other names (previous/current):\nNone")

    t4 = tables[4]
    set_cell(t4.rows[0].cells[0], "Spouse Full Name:\nN/A")
    set_cell(t4.rows[0].cells[1], "Occupation:\nN/A\n\nEmployer:\nN/A")
    for row in t4.rows[1:]:
        set_cell(row.cells[0], "Child Name:\nN/A")
        set_cell(
            row.cells[1],
            "Date of Birth:\nN/A\n\nCurrent School:\nN/A\n\nCurrent Year Group:\nN/A\n\nAre you seeking a school place:\n☐ Yes   ☒ No   ☐ Already at JESS",
        )

    t6 = tables[6]
    set_cell(t6.rows[2].cells[1], "No")
    set_cell(t6.rows[3].cells[1], "No")
    set_cell(t6.rows[4].cells[1], "No")
    set_cell(t6.rows[5].cells[1], "10 days.\nShort-term illness only; no ongoing concerns disclosed.")
    set_cell(t6.rows[6].cells[1], "No")
    set_cell(t6.rows[7].cells[1], "No")
    set_cell(t6.rows[8].cells[1], "No accompanying dependents.")
    set_cell(t6.rows[9].cells[1], "None.")

    t7 = tables[7]
    for row_idx in range(2, 11):
        set_cell(t7.rows[row_idx].cells[1], "No")

    # Part 2 - Qualifications and employment history
    t9 = tables[9]
    set_cell(
        t9.rows[3].cells[0],
        "Ashariqa Private School - All Boys\nAl Azhari District, Khartoum South, Khartoum, Sudan",
    )
    set_cell(t9.rows[3].cells[1], "01/07/2016")
    set_cell(t9.rows[3].cells[2], "30/03/2017")
    set_cell(t9.rows[3].cells[3], "Sudanese Secondary Education Certificate\n(GCSE/A-Level equivalent)")
    set_cell(t9.rows[3].cells[4], "Overall 70.9%")
    set_cell(t9.rows[4].cells[0], "English Cultural Centre, Sudan")
    set_cell(t9.rows[4].cells[1], "01/01/2018")
    set_cell(t9.rows[4].cells[2], "31/12/2019")
    set_cell(t9.rows[4].cells[3], "Advanced English Language Communication Certificate")
    set_cell(t9.rows[4].cells[4], "N/A")

    t10 = tables[10]
    set_cell(t10.rows[3].cells[0], "N/A")
    set_cell(t10.rows[3].cells[1], "N/A")
    set_cell(t10.rows[3].cells[2], "N/A")

    t11 = tables[11]
    for row_idx in (3, 4):
        for cell in t11.rows[row_idx].cells:
            set_cell(cell, "N/A")
    for cell in t11.rows[6].cells:
        set_cell(cell, "None")

    t12 = tables[12]
    set_cell(t12.rows[3].cells[0], "N/A - not a registered teacher (LSA applicant)")
    set_cell(t12.rows[3].cells[1], "N/A")

    t13 = tables[13]
    set_cell(t13.rows[3].cells[0], "Safeguarding Training")
    set_cell(t13.rows[3].cells[1], "Dubai Schools Al Khawaneej / Taaleem")
    set_cell(t13.rows[3].cells[2], "2024")
    set_cell(t13.rows[4].cells[0], "First Aid Training")
    set_cell(t13.rows[4].cells[1], "Dubai Schools Al Khawaneej / Taaleem")
    set_cell(t13.rows[4].cells[2], "2024")
    set_cell(t13.rows[5].cells[0], "PAST Assessment / SPIRE / Science of Reading literacy intervention")
    set_cell(t13.rows[5].cells[1], "Unity High School")
    set_cell(t13.rows[5].cells[2], "2022-2023")

    t15 = tables[15]
    set_cell(
        t15.rows[2].cells[0],
        "I am applying for the 1:1 Learning Support Assistant role at JESS Arabian Ranches Primary because it closely matches my recent experience supporting individual pupils and small groups in British-curriculum schools in Dubai and Sudan. At Dubai Schools Al Khawaneej, I worked with teachers to adapt resources, deliver targeted support, track progress, and help students with SEND and EAL access learning with increasing independence. I also supported behaviour routines, break-time supervision, and communication with parents.\n\n"
        "Previously at Unity High School, I supported primary pupils through literacy intervention, one-to-one tutoring, and whole-class cover when needed. I am bilingual in Arabic and English, build positive relationships with pupils and colleagues, and value kindness, consistency, and teamwork. I hold a valid UAE residence visa, am based in Dubai, and would bring a strong work ethic, recent classroom experience, and a genuine commitment to inclusive practice at JESS.",
    )
    set_cell(t15.rows[5].cells[0], "Football, reading, video gaming, and community volunteering.")

    t17 = tables[17]
    set_cell(
        t17.rows[1].cells[1],
        "Taaleem Management LLC (Dubai Schools Al Khawaneej)\nCentury Plaza First Floor, Jumeirah Road, PO Box 76691, Dubai, UAE\nTel: 04 372 7000",
    )
    set_cell(t17.rows[2].cells[1], "From: 19/08/2024\nTo: 04/02/2025")
    set_cell(t17.rows[3].cells[1], "☒ Full Time      ☐ Part Time      ☐ Supply")
    set_cell(t17.rows[4].cells[1], "End of fixed-term contract on 04/02/2025; available immediately.")
    set_cell(t17.rows[5].cells[1], "Learning and Teaching Assistant")
    set_cell(t17.rows[6].cells[1], "Grades 6-7 / approximately ages 11-13")
    set_cell(t17.rows[7].cells[1], "End of fixed-term contract")
    set_cell(t17.rows[8].cells[1], "AED 3,000")
    set_cell(
        t17.rows[9].cells[1],
        "Housing Allowance (amount): N/A\nAccommodation: N/A\nMedical Insurance: Yes\nFlight Allowance (amount): N/A\nSchool Places (how many, discounted or free): N/A",
    )
    set_cell(t17.rows[10].cells[1], "As per contract")
    set_cell(t17.rows[11].cells[1], "AED\nNegotiable / aligned to school scale")
    set_cell(t17.rows[12].cells[1], "AED\nNegotiable / aligned to school scale")

    t19 = tables[19]
    set_cell(
        t19.rows[0].cells[0],
        "Name, address and telephone number of school or employer/Self Employed:\nUnity High School\nQasr Street, PO Box 85, Khartoum, Sudan\nTel: +249 183 786585",
    )
    set_cell(t19.rows[1].cells[0], "☒ Full Time      ☐ Part Time      ☐ Supply")
    set_cell(t19.rows[1].cells[1], "☐ Early Years   ☒ Primary   ☒ Secondary")
    set_cell(t19.rows[2].cells[0], "Dates employed from:\n01/09/2022")
    set_cell(t19.rows[2].cells[1], "Dates employed to:\n31/07/2023")
    set_cell(t19.rows[3].cells[0], "Position held:\nTeaching Assistant")
    set_cell(t19.rows[3].cells[1], "Final salary excluding benefits:\nN/A")
    set_cell(t19.rows[4].cells[0], "Reason for leaving:\nSchool closed due to conflict in Sudan")

    t20 = tables[20]
    set_cell(
        t20.rows[0].cells[0],
        "Name, address and telephone number of school or employer/Self Employed:\nLocal NGO / EU-funded education project (EQUIP II)\nSudan",
    )
    set_cell(t20.rows[1].cells[0], "☐ Full Time      ☒ Part Time      ☐ Supply")
    set_cell(t20.rows[1].cells[1], "☐ Early Years   ☐ Primary   ☐ Secondary")
    set_cell(t20.rows[2].cells[0], "From:\n01/01/2021")
    set_cell(t20.rows[2].cells[1], "To:\n31/12/2022")
    set_cell(t20.rows[3].cells[0], "Position held:\nVolunteer / Project Assistant")
    set_cell(t20.rows[3].cells[1], "Final salary excluding benefits:\nN/A")
    set_cell(t20.rows[4].cells[0], "Reason for leaving:\nMoved into school-based teaching assistant work")

    t21 = tables[21]
    set_cell(
        t21.rows[0].cells[0],
        "Name, address and telephone number of school or employer/Self Employed:\nUN Online Volunteering Platform (remote)\nTranslation of the UN Humanitarian Overview for Sudan",
    )
    set_cell(t21.rows[1].cells[0], "☐ Full Time      ☒ Part Time      ☐ Supply")
    set_cell(t21.rows[1].cells[1], "☐ Early Years   ☐ Primary   ☐ Secondary")
    set_cell(t21.rows[2].cells[0], "From:\n01/01/2021")
    set_cell(t21.rows[2].cells[1], "To:\n31/12/2022")
    set_cell(t21.rows[3].cells[0], "Position held:\nOnline Volunteer Translator")
    set_cell(t21.rows[3].cells[1], "Final salary excluding benefits:\nN/A")
    set_cell(t21.rows[4].cells[0], "Reason for leaving:\nAssignment completed")

    t25 = tables[25]
    set_cell(t25.rows[3].cells[0], "Aug 2023")
    set_cell(t25.rows[3].cells[1], "Aug 2024")
    set_cell(
        t25.rows[3].cells[2],
        "Arrived in the UAE and undertook residency, credential attestation, and job searching following displacement due to the conflict in Sudan.",
    )
    set_cell(t25.rows[4].cells[0], "Feb 2025")
    set_cell(t25.rows[4].cells[1], "Apr 2026")
    set_cell(
        t25.rows[4].cells[2],
        "Seeking a new learning support assistant position following the end of contract at Taaleem; available in Dubai.",
    )
    set_cell(t25.rows[5].cells[0], "2018")
    set_cell(t25.rows[5].cells[1], "2019")
    set_cell(
        t25.rows[5].cells[2],
        "Completed English language development at English Cultural Centre alongside personal and professional development.",
    )

    t26 = tables[26]
    set_cell(
        t26.rows[0].cells[0],
        "Please provide the name and email contact details for three (3) professional referees from whom we will request a reference on your suitability for the role applied for. One must be your current or most recent headteacher or school Principal covering the last 6 years of employment. Please note that a reference will be taken from your current/last employer whether they are named as a referee or not. References from friends/relatives will not be accepted. Referees will be asked whether they have been the subject of any safeguarding concerns.\n\n"
        "It is our policy to take up email references prior to the interview. Please ensure that the email provided is current.\n\n"
        "It is part of our safer recruitment and vetting policy to contact referees prior to interview. Please indicate if we can contact any one or more of your referees prior to the interview.\n\n"
        "☒ I give permission to contact my references prior to the interview.\n"
        "☐ I give permission to contact my references prior to the interview excluding my current employer.\n"
        "☐ I do not give permission to contact my references prior to the interview.\n\n"
        f"Signed: Suraga Mohamed Daoud Elzibaer                                                                   Date: {SIGN_DATE}",
    )

    t27 = tables[27]
    set_cell(t27.rows[1].cells[0], "Name:\nAlicia")
    set_cell(t27.rows[1].cells[1], "Surname:\nRoberts")
    set_cell(t27.rows[1].cells[3], "Title:\n☐ Mr.   ☒ Ms.   ☐ Mrs.   ☐ Dr.")
    set_cell(t27.rows[2].cells[0], "Relationship to candidate:\nMost recent school principal / professional referee")
    set_cell(t27.rows[2].cells[1], "Organization:\nDubai Schools Al Khawaneej")
    set_cell(t27.rows[2].cells[3], "Position:\nSecondary Principal")
    set_cell(t27.rows[3].cells[0], "Mobile telephone number:\nN/A\nWork telephone number:\n04 372 7000")
    set_cell(
        t27.rows[3].cells[2],
        "Work email address:\naroberts@dubaischools-alkhawaneej.ae\nPersonal email address:\nN/A\nHR representative name and email address for pre-employment checks is required:\nNaureen Fazel Mohamed - NMohamed@dubaischools-alkhawaneej.ae",
    )

    t28 = tables[28]
    set_cell(t28.rows[1].cells[0], "Name:\nKathy")
    set_cell(t28.rows[1].cells[1], "Surname:\nMcLoughlin")
    set_cell(t28.rows[1].cells[3], "Title:\n☐ Mr.   ☒ Ms.   ☐ Mrs.   ☐ Dr.")
    set_cell(t28.rows[2].cells[0], "Relationship to candidate:\nFormer headteacher / professional referee")
    set_cell(t28.rows[2].cells[1], "Organization:\nUnity High School")
    set_cell(t28.rows[2].cells[3], "Position:\nHead of Primary")
    set_cell(t28.rows[3].cells[0], "Mobile telephone number:\n+353 87 473 8661\nWork telephone number:\n+249 183 786585")
    set_cell(
        t28.rows[3].cells[2],
        "Work email address:\nprimaryhead@unityhighschool.org\nPersonal email address:\nkatherine.mcloughlin@gmail.com\nHR representative name and email address for pre-employment checks is required:\nN/A - school currently suspended due to conflict in Sudan",
    )

    t29 = tables[29]
    set_cell(t29.rows[1].cells[0], "Name:\nJohn")
    set_cell(t29.rows[1].cells[1], "Surname:\nGarman")
    set_cell(t29.rows[1].cells[3], "Title:\n☒ Mr.   ☐ Ms.   ☐ Mrs.   ☐ Dr.")
    set_cell(t29.rows[2].cells[0], "Relationship to candidate:\nSchool principal / professional referee")
    set_cell(t29.rows[2].cells[1], "Organization:\nDubai Schools Al Khawaneej")
    set_cell(t29.rows[2].cells[3], "Position:\nPrincipal")
    set_cell(t29.rows[3].cells[0], "Mobile telephone number:\nN/A\nWork telephone number:\n04 372 7000")
    set_cell(
        t29.rows[3].cells[2],
        "Work email address:\nprincipal@dubaischools-alkhawaneej.ae\nPersonal email address:\nN/A\nHR representative name and email address for pre-employment checks is required:\nNaureen Fazel Mohamed - NMohamed@dubaischools-alkhawaneej.ae",
    )

    # Part 3 - declarations and consent
    t30 = tables[30]
    set_cell(
        t30.rows[0].cells[0],
        "ONLINE and SOCIAL MEDIA SEARCHES:\n"
        "Online and Social Media searches are required as part of our shortlisting process. If you are shortlisted for interview an appropriate online search will be undertaken. Any information will be treated as confidential and will only be used in relation to the role for which you have applied. I understand that online and Social Media searches will be conducted on my name(s) if I am shortlisted for the role I have applied for. I am also aware that JESS may want to explore anything they find with me.\n\n"
        "The following are my account details\n"
        "Instagram: N/A\n"
        "Facebook: N/A\n"
        "X (formerly Twitter): N/A\n"
        "LinkedIn: linkedin.com/in/suraga-elzibaer\n"
        "TikTok: N/A\n"
        "Threads: N/A\n\n"
        f"Signed: Suraga Mohamed Daoud Elzibaer                                                                          Date: {SIGN_DATE}",
    )

    t31 = tables[31]
    set_cell(
        t31.rows[0].cells[0],
        "PROHIBITION CHECKS:\n"
        "As part of our safeguarding and vetting checks we will undertake a prohibition and barring checks. Any information will be treated as confidential and will only be used in relation to the role for which you have applied.\n"
        "I understand that prohibition and barring checks will be conducted if I am shortlisted for the role I have applied for and I have provided all relevant information such as my National Insurance number, full name(s), date of birth and teacher registration numbers for each country in which I was registered as a teacher. I am also aware that JESS may want to explore anything they find with me.\n\n"
        f"Signed: Suraga Mohamed Daoud Elzibaer                                                                Date: {SIGN_DATE}",
    )

    t32 = tables[32]
    set_cell(
        t32.rows[0].cells[0],
        "DECLARATION\n"
        "I declare that the information I have provided is complete and true to the best of my knowledge and belief.\n"
        "I understand that any offer of appointment and subsequent employment is strictly subject and conditional on this declaration and safer recruitment checks and if my application is incomplete, untrue, or inaccurate then JESS shall be entitled to withdraw any offer of appointment or terminate any contract of employment prior to or after contract commencement date or thereafter.\n"
        "I understand that the information provided on this application form will be used to form the basis of a personnel file and computerized personnel record should an offer of appointment be made.\n"
        "I confirm that there is no information in the public domain or on social media platforms that could bring my name or the school's name into disrepute.\n"
        "I acknowledge that I have an ongoing duty to inform the school immediately if I or a member of my household is arrested or investigated by any regulatory authority into any matters relating to behaviors or concerns towards children and young persons.\n"
        "I understand that the information contained in my application form(s), the results of any police certificates of good conduct, Enhanced DBS and/or ICPC and information provided by third parties (referees, previous employers) may be supplied to other persons or organisations in circumstances where the school considers this necessary to safeguard children and young persons.\n\n"
        f"Signed: Suraga Mohamed Daoud Elzibaer                                                                Date: {SIGN_DATE}",
    )

    t33 = tables[33]
    set_cell(
        t33.rows[0].cells[0],
        "Should I not be successful in my application I confirm that I\n\n"
        "☒ Consent\n\n"
        "☐ Do not consent\n\n"
        "To my details being retained by JESS after six months from date of notification of unsuccessful application.\n\n"
        f"Signed: Suraga Mohamed Daoud Elzibaer                                                                  Date: {SIGN_DATE}\n",
    )

    OUTPUT_DOCX.parent.mkdir(parents=True, exist_ok=True)
    doc.save(str(OUTPUT_DOCX))
    return OUTPUT_DOCX


def export_pdf(docx_path: Path, pdf_path: Path) -> bool:
    try:
        import pythoncom
        import win32com.client
    except Exception:
        return False

    word = None
    document = None
    try:
        pythoncom.CoInitialize()
        word = win32com.client.DispatchEx("Word.Application")
        word.Visible = False
        document = word.Documents.Open(str(docx_path))
        document.SaveAs(str(pdf_path), FileFormat=17)
        return True
    except Exception:
        return False
    finally:
        if document is not None:
            try:
                document.Close(False)
            except Exception:
                pass
        if word is not None:
            try:
                word.Quit()
            except Exception:
                pass
        try:
            pythoncom.CoUninitialize()
        except Exception:
            pass


def main() -> int:
    if not TEMPLATE.exists():
        raise FileNotFoundError(f"Template not found: {TEMPLATE}")

    docx_path = fill_docx()
    pdf_created = export_pdf(docx_path, OUTPUT_PDF)

    print(f"Filled DOCX created: {docx_path}")
    if pdf_created and OUTPUT_PDF.exists():
        print(f"Filled PDF created:  {OUTPUT_PDF}")
    else:
        print("PDF export skipped or failed.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
