# RSSB Sewadar Management - Color Guide

This document provides comprehensive guidance on the color system used in the RSSB Sewadar Management application, including the complete color palette, usage guidelines, and implementation examples.

## 🎨 Brand Color Palette

### Primary RSSB Colors

| Color | Hex Code | Usage | Sample |
|-------|----------|-------|---------|
| **Deep Red** | `#8B0000` | Primary brand color, main buttons, headers | ![#8B0000](https://via.placeholder.com/20x20/8B0000/8B0000.png) |
| **Charcoal** | `#212529` | Primary text color, main content | ![#212529](https://via.placeholder.com/20x20/212529/212529.png) |
| **Cornsilk** | `#FFF8DC` | Main background color | ![#FFF8DC](https://via.placeholder.com/20x20/FFF8DC/FFF8DC.png) |
| **Bright Blue** | `#007BFF` | Secondary actions, links | ![#007BFF](https://via.placeholder.com/20x20/007BFF/007BFF.png) |
| **White** | `#FFFFFF` | Cards, modals, contrast text | ![#FFFFFF](https://via.placeholder.com/20x20/FFFFFF/000000.png) |

### Extended Palette

#### Cream Tones
- **Light Cream** (`#F6F4EF`) - Subtle backgrounds, disabled states
- **Medium Cream** (`#E8E4DA`) - Light borders, hover states  
- **Dark Cream** (`#C6C1B4`) - Medium borders, separators
- **Gray** (`#837E78`) - Muted text, icons

#### Blue Tones  
- **Light Accent Blue** (`#7C9CBF`) - Info badges, light accents
- **Medium Blue** (`#5C7894`) - Secondary buttons, viewer role
- **Darker Blue** (`#415A77`) - Navigation, headers
- **Darkest Blue** (`#324358`) - Dark backgrounds, footer

#### Warm Tones
- **Light Gold** (`#EAB570`) - Warning states, pending status
- **Peach** (`#EB8573`) - Warm accents, notifications  
- **Coral** (`#E0615F`) - Error states, alerts
- **Gold** (`#C1912B`) - Warning text, important highlights

#### Neutral
- **Beige** (`#EEE8DC`) - Alternative background, subtle contrast

## 📊 Semantic Color Usage

### Status Colors

| Status | Color | Hex | Usage |
|--------|-------|-----|-------|
| **Success** | Green | `#28A745` | Completed naamdan, successful actions |
| **Warning** | Gold | `#C1912B` | Pending status, alerts |
| **Error** | Coral | `#E0615F` | Failed actions, validation errors |
| **Info** | Bright Blue | `#007BFF` | Informational messages, help text |

### Role-Based Colors

| Role | Color | Hex | Usage |
|------|-------|-----|-------|
| **Admin** | Deep Red | `#8B0000` | Admin badges, admin-only features |
| **Editor** | Bright Blue | `#007BFF` | Editor badges, edit permissions |
| **Viewer** | Medium Blue | `#5C7894` | Viewer badges, read-only access |

### Contextual Colors

| Context | Color | Hex | Usage |
|---------|-------|-----|-------|
| **Naamdan Complete** | Success Green | `#28A745` | Complete status indicators |
| **Naamdan Pending** | Light Gold | `#EAB570` | Pending status indicators |
| **Aadhar Verification** | Medium Blue | `#5C7894` | Aadhar document type |
| **PAN Verification** | Coral | `#E0615F` | PAN document type |
| **Other Verification** | Dark Cream | `#C6C1B4` | Other document types |

## 🎯 Usage Guidelines

### Primary Actions
Use **Deep Red** (`#8B0000`) for:
- Primary buttons (Save, Submit, Add)
- Main navigation active states
- Important call-to-action elements
- Brand elements and logos

### Secondary Actions  
Use **Bright Blue** (`#007BFF`) for:
- Secondary buttons (Edit, View)
- Links and hyperlinks
- Info badges and notifications
- Non-critical interactive elements

### Text Hierarchy
- **Primary Text**: Charcoal (`#212529`) - Main content, headings
- **Secondary Text**: Gray (`#837E78`) - Descriptions, metadata  
- **Disabled Text**: Light Gray (`#ADB5BD`) - Inactive states
- **Inverse Text**: White (`#FFFFFF`) - Text on dark backgrounds

### Backgrounds
- **Main Background**: Cornsilk (`#FFF8DC`) - Application background
- **Surface Background**: White (`#FFFFFF`) - Cards, modals, panels
- **Elevated Background**: Light Cream (`#F6F4EF`) - Hover states, highlights

## 💻 Implementation Examples

### CSS Custom Properties
```css
:root {
  /* Primary Brand Colors */
  --color-primary: #8B0000;
  --color-secondary: #007BFF;
  --color-background: #FFF8DC;
  --color-surface: #FFFFFF;
  --color-text: #212529;
  
  /* Status Colors */
  --color-success: #28A745;
  --color-warning: #C1912B;
  --color-error: #E0615F;
  --color-info: #007BFF;
}
```

### React/JavaScript
```javascript
import { semanticColors } from './styles/colors';

// Primary button style
const primaryButtonStyle = {
  backgroundColor: semanticColors.primary.main,
  color: semanticColors.primary.contrast,
  border: 'none',
  borderRadius: '8px',
  padding: '12px 24px'
};

// Status badge
const getStatusColor = (status) => {
  return status ? semanticColors.status.success.main : semanticColors.status.warning.main;
};
```

### Tailwind CSS Classes
```html
<!-- Primary button -->
<button class="bg-primary text-white hover:bg-primary-light">
  Save Changes
</button>

<!-- Status badge -->
<span class="px-3 py-1 text-sm rounded-full bg-success-light text-success">
  Complete
</span>

<!-- Card -->
<div class="bg-surface border border-border-main rounded-lg shadow">
  Card content
</div>
```

## 🔧 Accessibility Considerations

### Contrast Ratios
All color combinations meet WCAG 2.1 AA standards:
- **Text on Background**: Minimum 4.5:1 contrast ratio
- **Large Text**: Minimum 3:1 contrast ratio  
- **Interactive Elements**: Minimum 3:1 contrast ratio

### Color Blind Accessibility
- Never rely solely on color to convey information
- Use icons, text labels, and patterns alongside colors
- Test with color blind simulators

### High Contrast Mode Support
```css
@media (prefers-contrast: high) {
  :root {
    --color-border: #000000;
    --color-text-light: #000000;
  }
}
```

## 📱 Responsive Design Colors

### Mobile Optimizations
- Maintain color consistency across all screen sizes
- Ensure touch targets have adequate color contrast
- Consider battery-saving dark mode variations

### Print Styles
```css
@media print {
  :root {
    --color-background: #ffffff;
    --color-text: #000000;
  }
}
```

## 🌟 Design Tokens

### Spacing with Color Context
```javascript
export const coloredComponents = {
  primaryButton: {
    backgroundColor: '#8B0000',
    padding: '12px 24px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(139, 0, 0, 0.2)'
  },
  warningAlert: {
    backgroundColor: '#FFF3CD',
    borderLeft: '4px solid #C1912B',
    color: '#856404'
  }
};
```

## ✅ Best Practices

### Do's ✅
- Use the defined color palette consistently
- Follow semantic color meanings (red for errors, green for success)
- Maintain proper contrast ratios for accessibility
- Use color tokens/variables instead of hardcoded hex values
- Test colors in different lighting conditions

### Don'ts ❌
- Don't use colors outside the defined palette without approval
- Don't rely solely on color to convey important information  
- Don't use low contrast color combinations
- Don't hardcode hex values throughout the application
- Don't ignore accessibility guidelines

## 🔄 Future Considerations

### Dark Mode Support
Prepare for future dark mode implementation:
```css
@media (prefers-color-scheme: dark) {
  :root {
    --color-background: #1a1a1a;
    --color-surface: #2d2d2d;
    --color-text: #ffffff;
  }
}
```

### Brand Evolution
- Colors may evolve with RSSB brand updates
- Maintain backward compatibility when possible
- Document all changes with migration guides

---

**For questions about color usage, contact the design team or refer to the RSSB brand guidelines.**