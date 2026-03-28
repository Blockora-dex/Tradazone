import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Input from '../../components/forms/Input';
import Button from '../../components/forms/Button';
import { useData } from '../../context/DataContext';

function AddCustomer() {
    const navigate = useNavigate();
    const { addCustomer } = useData();
    const [formData, setFormData] = useState({ name: '', email: '', phone: '', address: '' });
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const validate = () => {
        const newErrors = {};
        if (!formData.name.trim()) {
            newErrors.name = 'Customer name is required';
        }
        if (!formData.email.trim()) {
            newErrors.email = 'Email address is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }
        return newErrors;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Guard: prevent duplicate submissions
        if (isSubmitting) {
            console.warn('[AddCustomer] Duplicate submission attempt blocked');
            return;
        }
        
        const validationErrors = validate();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }
        
        setIsSubmitting(true);
        try {
            addCustomer(formData);
            navigate('/customers');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleChange = (field) => (e) => {
        setFormData({ ...formData, [field]: e.target.value });
        // Clear error for this field when user starts typing
        if (errors[field]) {
            setErrors({ ...errors, [field]: undefined });
        }
    };

    return (
        <div>
            <div className="mb-6">
                <Link to="/customers" className="inline-flex items-center gap-1.5 text-sm text-t-muted hover:text-brand transition-colors mb-2">
                    <ArrowLeft size={16} /> Back to Customers
                </Link>
                <h1 className="text-xl font-semibold text-t-primary">Add Customer</h1>
            </div>

            <form onSubmit={handleSubmit} className="bg-white border border-border rounded-card p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
                    <Input 
                        label="Full Name" 
                        placeholder="Enter customer name" 
                        value={formData.name} 
                        onChange={handleChange('name')} 
                        required 
                        error={errors.name}
                    />
                    <Input 
                        label="Email" 
                        type="email" 
                        placeholder="Enter email address" 
                        value={formData.email} 
                        onChange={handleChange('email')} 
                        required 
                        error={errors.email}
                    />
                    <Input 
                        label="Phone" 
                        placeholder="Enter phone number" 
                        value={formData.phone} 
                        onChange={handleChange('phone')} 
                    />
                    <Input 
                        label="Address" 
                        placeholder="Enter address" 
                        value={formData.address} 
                        onChange={handleChange('address')} 
                    />
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t border-border">
                    <Button variant="secondary" onClick={() => navigate('/customers')} disabled={isSubmitting}>Cancel</Button>
                    <Button type="submit" variant="primary" disabled={isSubmitting}>
                        {isSubmitting ? 'Adding...' : 'Add Customer'}
                    </Button>
                </div>
            </form>
        </div>
    );
}

export default AddCustomer;
