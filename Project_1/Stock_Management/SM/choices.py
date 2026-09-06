Product_Type = (('Product', 'Product'), ('Service', 'Service'))

PaymentStatus = (
        ("7", "Net 7"),
        ("10", "Net 10"),
        ("15", "Net 15"),
        ("30", "Net 30"),
        ("45", "Net 45"),
        ("60", "Net 60"),
        ("90", "Net 90"),
        ("0", "Due on Receipt"),
        # ("Due on The Specified Date", "Due on The Specified Date"),
    )

TypeUOM = (
    ('Boxes', 'Boxes'),
    ('CFT', 'CFT'),
    ('Centimerets', 'Centimerets'),
    ('Cubic Meters', 'Cubic Meters'),
    ('Gram', 'Gram'),
    ('Hours', 'Hours'),
    ('Inches', 'Inches'),
    ('Killowgrams', 'Killowgrams'),
    ('Piece', 'Piece'),
)

WithGstOrNot = (
    ('Yes', 'Yes'),
    ('No', 'No'),
)

TaxType = (
        ('0', 'None'),
        ('1', '1% GST'),
        ('3', '3% GST'),
        ('5', '5% GST'),
        ('12', '12% GST'),
        ('18', '18% GST'),
        ('28', '28% GST'),
    )

Prices = (
        ('Exclusive of taxes', 'Exclusive of taxes'),
        ('Inclusive of taxes', 'Exclusive of taxes')
    )

Places = (
    ('Andaman and Nicobar Islands', 'Andaman and Nicobar Islands'),
    ('Andhra Pradesh', 'Andhra Pradesh'),
    ('Arunachal Pradesh', 'Arunachal Pradesh'),
    ('Assam', 'Assam'),
    ('Bihar', 'Bihar'),
    ('Chandigarh', 'Chandigarh'),
    ('Chhattisgarh', 'Chhattisgarh'),
    ('Dadra and Nagar Haveli', 'Dadra and Nagar Haveli'),
    ('Daman and Diu', 'Daman and Diu'),
    ('Goa', 'Goa'),
    ('Gujarat', 'Gujarat'),
    ('Haryana', 'Haryana'),
    ('Himachal Pradesh', 'Himachal Pradesh'),
    ('Jammu and Kashmir', 'Jammu and Kashmir'),
    ('Jharkhand', 'Jharkhand'),
    ('Karnataka', 'Karnataka'),
    ('Kerala', 'Kerala'),
    ('Ladakh', 'Ladakh'),
    ('Lakshadweep', 'Lakshadweep'),
    ('Madhya Pradesh', 'Madhya Pradesh'),
    ('Maharashtra', 'Maharashtra'),
    ('Manipur', 'Manipur'),
    ('Meghalaya', 'Meghalaya'),
    ('Mizoram', 'Mizoram'),
    ('Nagaland', 'Nagaland'),
    ('Delhi', 'Delhi'),
    ('Odisha', 'Odisha'),
    ('Puducherry', 'Puducherry'),
    ('Punjab', 'Punjab'),
    ('Rajasthan', 'Rajasthan'),
    ('Sikkim', 'Sikkim'),
    ('Tamil Nadu', 'Tamil Nadu'),
    ('Telangana', 'Telangana'),
    ('Tripura', 'Tripura'),
    ('Uttar Pradesh', 'Uttar Pradesh'),
    ('Uttarakhand', 'Uttarakhand'),
    ('West Bengal', 'West Bengal')
)

Payment_status = (
        ("Received", "Received"),
        ("Mad", "Mad"),
    )

Payment_Type = (
        ("Cash", "Cash"),
        ("Cash Memo", "Cash Memo"),
        ("Credit Note", "Credit Note"),
        ("Credit Card", "Credit Card"),
        ("Check", "Check"),
        ("Cheque", "Cheque"),
        ("Bank Transfer", "Bank Transfer"),
        ("Pay Slip", "Pay Slip"),
    )