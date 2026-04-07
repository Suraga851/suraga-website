#!/usr/bin/env python3
from __future__ import annotations

import argparse
import sys
from pathlib import Path
from typing import Dict, Iterable

from pypdf import PdfReader, PdfWriter
from pypdf.generic import BooleanObject, NameObject


BASE_TEXT_FIELDS: Dict[str, str] = {
    "Title": "Mr",
    "Gender": "Male",
    "Surname": "Elzibaer",
    "First Name": "Suraga",
    "If yes please provide their names": "",
    "How did you hear about the position at SBS": "Safa British School website",
    "How did you hear about the position at SBS_2": "Safa British School website",
    "Current address": "Dubai, UAE",
    "Telephone No": "0565565189",
    "Email Address": "suragaelzibaer@gmail.com",
    "Date of Birth": "25/12/1998",
    "Age": "27",
    "Nationality": "Sudanese",
    "Emergency Contact Details Family MemberFriend in UAE": "",
    "Name Mobile No": "",
    "InstitutionRow1": "Ashariqa Private School - All Boys (Sudan)",
    "Dates attendedRow1": "Completed 13/03/2017",
    "Subjects studiedRow1": "Sudanese secondary curriculum",
    "Qualifications obtainedRow1": "Sudanese Secondary Education Certificate (Score 70.9)",
    "Class of DegreeRow1": "N/A",
    "3 Details of Teaching Qualification": "None",
    "InstitutionRow1_2": "N/A",
    "DatesRow1": "N/A",
    "SubjectsRow1": "N/A",
    "QualificationRow1": "N/A",
    "4 Date qualified": "N/A",
    "Course attendedRow1": "S.P.I.R.E reading intervention program",
    "DatesRow1_2": "2022-2023",
    "DetailsRow1": "Science of Reading literacy intervention at Unity High School",
    "Post": "Not currently employed (last role: Learning Assistant)",
    "7 Present EmploymentRow1": "UAE",
    "Date of employmentRow1": "N/A",
    "Please confirm 1 Current notice period 2 Current monthly salary 3 Additional benefits eg responsibility allowance housing allowance living allowance medical etc": "Notice period: Immediate | Current monthly salary: AED 5,000 | Additional benefits: None",
    "Employer  name of school or companyRow1": "Dubai Schools Al Khawaneej (Taaleem)\nUnity High School",
    "PositionRow1": "Learning and Teaching Assistant\nTeaching Assistant",
    "CountryRow1": "UAE\nSudan",
    "Dates of employment and reason for leavingRow1": "19/08/2024-04/02/2025 (employment ended)\n09/2022-07/2023 (school closure due war)",
    "Text2": "",
    "Text3": "",
    "9 Please summarise any interests or personal significant achievementsRow1": "Interests: football, video gaming, reading. Supported literacy interventions and selected for teacher training opportunities.",
    "How many days have you taken off work through illness in the last 3 years": "0",
    "Text4": "No ongoing medical conditions or pending operations.",
    "Text5": "No underlying reasons preventing full professional responsibilities.",
    "Have you ever been subject to disciplinary proceedings where the disciplinary sanction is still current or where proceedings are ongoing Please provide details": "No disciplinary proceedings.",
    "Please declare any interm holidaystime off booked for the current if applicable or next academic year": "None",
    "NameRow1": "",
    "RelationshipRow1": "",
    "DOB if Under 18Row1": "",
    "NameRow2": "",
    "RelationshipRow2": "",
    "DOB if Under 18Row2": "",
    "NameRow3": "",
    "RelationshipRow3": "",
    "DOB if Under 18Row3": "",
    "Please confirm if your childchildren currently attend Safa British School": "No",
    "reference16": "Katherine \"Kathy\" McLoughlin",
    "reference15": "Former Head of Primary, Unity High School",
    "reference14": "Unity High School, Qasr Street, Khartoum, Sudan",
    "reference3": "+353 87 473 8661",
    "reference2": "primaryhead@unityhighschool.org",
    "reference6": "Peris Naliaka",
    "reference5": "Main Classroom Teacher, Unity High School",
    "reference4": "Unity High School, Khartoum, Sudan",
    "reference7": "+254 705 156178",
    "reference111": "mukhwanaperis@gmail.com",
    "reference8": "Naureen Fazel Mohamed",
    "reference9": "HR Officer, Taaleem Management LLC (Branch)",
    "reference11": "Century Plaza First Floor, Jumeirah Road, PO Box 76691, Dubai, UAE",
    "reference10": "+971 (0)4 349 8806",
    "reference12": "",
    "Date of last CRB check or equivalent": "N/A",
    "If yes please provide further details": "",
    "If yes please provide further information": "",
    "If yes please provide further information_2": "",
    "If yes please provide further information_3": "",
    "Signature of candidate": "Suraga Mohamed Daoud Elzibaer",
    "Print name": "Suraga Mohamed Daoud Elzibaer",
}

BUTTON_FIELDS: Dict[str, str] = {
    "Circle9": "/Choice2",
    "Circle6": "/Choice19",
    "Circle1": "/Choice4",
    "Please tick this box if you do not wish for your references to be contacted prior to interview": "/Off",
    "Group1": "/1",
    "Group3": "/Choice11",
    "Group5": "/Off",
    "Group6": "/Choice13",
    "Group7": "/Off",
    "Group8": "/Choice15",
    "Group9": "/Off",
    "Group10": "/Choice17",
    "tick1": "/On",
    "undefined_2": "/On",
    "undefined_3": "/On",
    "undefined_4": "/On",
}


def build_text_fields(sign_date: str) -> Dict[str, str]:
    text_fields = dict(BASE_TEXT_FIELDS)
    text_fields["Signed"] = "Suraga Mohamed Daoud Elzibaer"
    text_fields["Date"] = sign_date
    text_fields["Signed_2"] = "Suraga Mohamed Daoud Elzibaer"
    text_fields["Date_2"] = sign_date
    text_fields["Signed_3"] = "Suraga Mohamed Daoud Elzibaer"
    text_fields["Date_3"] = sign_date
    text_fields["Date_4"] = sign_date
    return text_fields


def _iter_widgets_for_field(writer: PdfWriter, field_name: str):
    for page in writer.pages:
        annots = page.get("/Annots")
        if not annots:
            continue
        for annot_ref in annots:
            annot = annot_ref.get_object()
            this_name = annot.get("/T")
            parent = annot.get("/Parent")
            field_obj = annot

            if this_name is None and parent is not None:
                parent_obj = parent.get_object()
                if str(parent_obj.get("/FT")) == "/Btn":
                    this_name = parent_obj.get("/T")
                    field_obj = parent_obj

            if this_name is None:
                continue
            if str(this_name) != field_name:
                continue
            if str(field_obj.get("/FT")) != "/Btn":
                continue
            yield annot, field_obj


def _set_button_field(writer: PdfWriter, field_name: str, target_state: str) -> None:
    widgets = list(_iter_widgets_for_field(writer, field_name))
    if not widgets:
        raise KeyError(f"Button field not found: {field_name}")

    for annot, _ in widgets:
        annot[NameObject("/AS")] = NameObject("/Off")

    if target_state != "/Off":
        applied = False
        for annot, _ in widgets:
            ap_dict = annot.get("/AP")
            if not ap_dict or "/N" not in ap_dict:
                continue
            normal = ap_dict["/N"]
            states = {str(key) for key in normal.keys()}
            if target_state in states:
                annot[NameObject("/AS")] = NameObject(target_state)
                applied = True
                break
        if not applied:
            raise ValueError(f"State {target_state} not available for button field {field_name}")

    for _, field_obj in widgets:
        field_obj[NameObject("/V")] = NameObject(target_state)


def fill_form(input_pdf: Path, output_pdf: Path, sign_date: str) -> None:
    reader = PdfReader(str(input_pdf))
    writer = PdfWriter()
    writer.clone_document_from_reader(reader)

    text_fields = build_text_fields(sign_date)
    for page in writer.pages:
        writer.update_page_form_field_values(page, text_fields, auto_regenerate=False)

    for button_name, state in BUTTON_FIELDS.items():
        _set_button_field(writer, button_name, state)

    acro_form = writer._root_object.get("/AcroForm")
    if acro_form:
        acro_form.get_object()[NameObject("/NeedAppearances")] = BooleanObject(False)

    output_pdf.parent.mkdir(parents=True, exist_ok=True)
    with output_pdf.open("wb") as fh:
        writer.write(fh)


def _load_field_values(pdf_path: Path) -> Dict[str, object]:
    fields = PdfReader(str(pdf_path)).get_fields() or {}
    return {name: data.get("/V") for name, data in fields.items()}


def _assert(actual: object, expected: str, label: str) -> None:
    if expected == "/Off":
        if actual is None or str(actual) == "/Off":
            return
        raise AssertionError(f"{label}: expected /Off, got {actual!r}")
    if str(actual) != expected:
        raise AssertionError(f"{label}: expected {expected!r}, got {actual!r}")


def validate_output(pdf_path: Path, sign_date: str) -> None:
    values = _load_field_values(pdf_path)
    expected_text = {
        "Title": "Mr",
        "Surname": "Elzibaer",
        "First Name": "Suraga",
        "Telephone No": "0565565189",
        "Email Address": "suragaelzibaer@gmail.com",
        "Date of Birth": "25/12/1998",
        "Age": "27",
        "Nationality": "Sudanese",
        "Date of last CRB check or equivalent": "N/A",
        "Signed": "Suraga Mohamed Daoud Elzibaer",
        "Date": sign_date,
        "Signed_2": "Suraga Mohamed Daoud Elzibaer",
        "Date_2": sign_date,
        "Signed_3": "Suraga Mohamed Daoud Elzibaer",
        "Date_3": sign_date,
        "Signature of candidate": "Suraga Mohamed Daoud Elzibaer",
        "Print name": "Suraga Mohamed Daoud Elzibaer",
        "Date_4": sign_date,
        "reference16": "Katherine \"Kathy\" McLoughlin",
        "reference6": "Peris Naliaka",
        "reference8": "Naureen Fazel Mohamed",
    }
    for field_name, expected in expected_text.items():
        _assert(values.get(field_name), expected, field_name)

    for field_name, expected_state in BUTTON_FIELDS.items():
        _assert(values.get(field_name), expected_state, field_name)


def _parse_args(argv: Iterable[str]) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Fill SBS Application Form PDF fields.")
    parser.add_argument("--input-pdf", required=True, help="Path to source SBS form PDF.")
    parser.add_argument("--output-pdf", required=True, help="Path to write filled PDF.")
    parser.add_argument("--sign-date", default="03/03/2026", help="Signature date in DD/MM/YYYY format.")
    parser.add_argument("--skip-validation", action="store_true", help="Skip post-write validation checks.")
    return parser.parse_args(list(argv))


def main(argv: Iterable[str]) -> int:
    args = _parse_args(argv)
    input_pdf = Path(args.input_pdf)
    output_pdf = Path(args.output_pdf)

    if not input_pdf.exists():
        print(f"Input PDF not found: {input_pdf}", file=sys.stderr)
        return 1

    fill_form(input_pdf=input_pdf, output_pdf=output_pdf, sign_date=args.sign_date)

    if not args.skip_validation:
        validate_output(output_pdf, sign_date=args.sign_date)

    print(f"Filled PDF created: {output_pdf}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
