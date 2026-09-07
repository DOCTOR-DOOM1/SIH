import re
from schemas import FSSAIData

def perform_mock_fssai_lookup(fssai_number: str) -> FSSAIData:
    """
    Simulates a lookup in the FSSAI database to verify a license number.
    Returns mocked data for the demo.
    """
    if not fssai_number:
        return FSSAIData(
            license_number=None,
            is_registered=False,
            company_name=None,
            status_message="No FSSAI number detected in the image."
        )

    # Clean the input
    fssai_number = re.sub(r'[^0-9]', '', fssai_number)

    # Basic format check (FSSAI numbers are typically 14 digits)
    if len(fssai_number) >= 10:
        return FSSAIData(
            license_number=fssai_number,
            is_registered=True,  # Assume true format, but let Gemini RAG verify real company
            company_name=None,
            status_message="Format valid. Awaiting Google Search Grounding for real verification."
        )
    else:
        return FSSAIData(
            license_number=fssai_number,
            is_registered=False,
            company_name=None,
            status_message="Invalid FSSAI number format."
        )
