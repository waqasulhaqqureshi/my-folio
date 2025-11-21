# Certificate Images

This folder contains the certificate images for the portfolio.

## Required Images

Please add the following certificate images to this folder:

1. **cs50-certificate.jpg** (or .png, .webp)
   - CS50 Certificate from Harvard University
   - Recipient: Waqas Ul Haq Qureshi
   - Year: 2022

2. **mimo-sql-certificate.jpg** (or .png, .webp)
   - Mimo SQL Certificate of Achievement
   - Recipient: Waqas Ul Haq Qureshi
   - Issue Date: September 22, 2023

3. **mimo-webdev-certificate.jpg** (or .png, .webp)
   - Mimo Web Development Certificate of Achievement
   - Recipient: Waqas Ul Haq Qureshi
   - Issue Date: September 22, 2023

## Optional Images

You can also add organization logos:

- **harvard-logo.png** - Harvard University logo
- **mimo-logo.png** - Mimo logo

If you don't add these, the profile placeholder will be used.

## After Adding Images

After adding the certificate images, update the imports in `app/reviews-section/certificateDetails.ts`:

```typescript
// Replace these lines:
const cs50Cert = profilePlaceholder;
const mimoSqlCert = profilePlaceholder;
const mimoWebDevCert = profilePlaceholder;

// With:
import cs50Cert from "../../public/certificates/cs50-certificate.jpg";
import mimoSqlCert from "../../public/certificates/mimo-sql-certificate.jpg";
import mimoWebDevCert from "../../public/certificates/mimo-webdev-certificate.jpg";
```

## Image Format

- Supported formats: .jpg, .jpeg, .png, .webp
- Recommended: Use .webp or .jpg for better optimization
- Make sure images are high quality for the modal preview

