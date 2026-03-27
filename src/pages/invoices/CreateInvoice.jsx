/**
 * CreateInvoice - Form component for creating new invoices
 * 
 * ISSUE FIXED: Form submission succeeds without required fields validation
 * - Added comprehensive client-side validation for both steps
 * - Validates customer selection and due date in step 1
 * - Validates invoice items (selection, quantity, price) in step 2
 * - Provides clear error messages and visual feedback
 * - Prevents submission with invalid data
 * - Includes loading states and error handling
 * 
 * Features:
 * - Two-step form process (Customer Details → Invoice Items)
 * - Real-time validation with error clearing on user input
 * - Prevents past due dates
 * - Ensures all required fields are filled
 * - Validates numeric inputs (quantity > 0, price > 0)
 * - Handles form submission errors gracefully
 */

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import Input from '../../components/forms/Input';
import Select from '../../components/forms/Select';
import Button from '../../components/forms/Button';
import { useData } from '../../context/DataContext';

function CreateInvoice() {
    const navigate = useNavigate();
    const { customers, items, addInvoice } = useData();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        customerId: '', dueDate: '', items: [{ itemId: '', quantity: 1, price: '' }]
    });
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    /**
     * Validates step 1 form data (customer information)
     * @returns {Object} Object containing validation errors
     */
    const validateStep1 = () => {
        const stepErrors = {};
        
        if (!formData.customerId.trim()) {
            stepErrors.customerId = 'Customer selection is required';
        }
        
        if (!formData.dueDate.trim()) {
            stepErrors.dueDate = 'Due date is required';
        } else {
            const dueDate = new Date(formData.dueDate);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            if (dueDate < today) {
                stepErrors.dueDate = 'Due date cannot be in the past';
            }
        }
        
        return stepErrors;
    };

    /**
     * Validates step 2 form data (invoice items)
     * @returns {Object} Object containing validation errors
     */
    const validateStep2 = () => {
        const stepErrors = {};
        const itemErrors = [];
        
        if (formData.items.length === 0) {
            stepErrors.items = 'At least one item is required';
            return stepErrors;
        }
        
        formData.items.forEach((item, index) => {
            const itemError = {};
            
            if (!item.itemId.trim()) {
                itemError.itemId = 'Item selection is required';
            }
            
            if (!item.quantity || item.quantity < 1) {
                itemError.quantity = 'Quantity must be at least 1';
            }
            
            if (!item.price || parseFloat(item.price) <= 0) {
                itemError.price = 'Price must be greater than 0';
            }
            
            if (Object.keys(itemError).length > 0) {
                itemErrors[index] = itemError;
            }
        });
        
        if (itemErrors.length > 0) {
            stepErrors.items = itemErrors;
        }
        
        return stepErrors;
    };

    /**
     * Clears validation errors for a specific field
     * @param {string} field - The field name to clear errors for
     */
    const clearFieldError = (field) => {
        if (errors[field]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    const customerOptions = customers.map(c => ({ value: c.id, label: c.name }));
    const itemOptions = items.map(i => ({ value: i.id, label: `${i.name} - ${i.price} ${i.currency}` }));

    const handleAddItem = () => {
        setFormData({ ...formData, items: [...formData.items, { itemId: '', quantity: 1, price: '' }] });
    };

    const handleRemoveItem = (index) => {
        setFormData({ ...formData, items: formData.items.filter((_, i) => i !== index) });
    };

    const handleItemChange = (index, field, value) => {
        const newItems = [...formData.items];
        newItems[index][field] = value;
        if (field === 'itemId') {
            const selectedItem = items.find(i => i.id === value);
            if (selectedItem) newItems[index].price = selectedItem.price;
        }
        setFormData({ ...formData, items: newItems });
        
        // Clear item-specific errors when user makes changes
        if (errors.items && errors.items[index] && errors.items[index][field]) {
            const newErrors = { ...errors };
            delete newErrors.items[index][field];
            if (Object.keys(newErrors.items[index]).length === 0) {
                delete newErrors.items[index];
            }
            if (Object.keys(newErrors.items).length === 0) {
                delete newErrors.items;
            }
            setErrors(newErrors);
        }
    };

    const calculateTotal = () => {
        return formData.items.reduce((total, item) => {
            return total + ((parseFloat(item.price) || 0) * (parseInt(item.quantity) || 0));
        }, 0);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        try {
            if (step === 1) {
                // Validate step 1
                const stepErrors = validateStep1();
                if (Object.keys(stepErrors).length > 0) {
                    setErrors(stepErrors);
                    return;
                }
                
                // Clear errors and proceed to step 2
                setErrors({});
                setStep(2);
            } else {
                // Validate step 2
                const stepErrors = validateStep2();
                if (Object.keys(stepErrors).length > 0) {
                    setErrors(stepErrors);
                    return;
                }
                
                // All validation passed, create invoice
                setErrors({});
                await addInvoice(formData);
                navigate('/invoices');
            }
        } catch (error) {
            console.error('Error creating invoice:', error);
            setErrors({ submit: 'Failed to create invoice. Please try again.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div>
            <div className="mb-6">
                <Link to="/invoices" className="inline-flex items-center gap-1.5 text-sm text-t-muted hover:text-brand transition-colors mb-2">
                    <ArrowLeft size={16} /> Back to Invoices
                </Link>
                <h1 className="text-xl font-semibold text-t-primary">Create Invoice</h1>
            </div>

            {/* Step Indicators */}
            <div className="flex items-center gap-4 mb-8">
                <div className={`flex items-center gap-2 ${step >= 1 ? 'text-brand' : 'text-t-muted'}`}>
                    <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold ${step >= 1 ? 'bg-brand text-white' : 'bg-border text-t-muted'}`}>1</span>
                    <span className="text-sm font-medium">Customer Details</span>
                </div>
                <div className="flex-1 h-px bg-border" />
                <div className={`flex items-center gap-2 ${step >= 2 ? 'text-brand' : 'text-t-muted'}`}>
                    <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold ${step >= 2 ? 'bg-brand text-white' : 'bg-border text-t-muted'}`}>2</span>
                    <span className="text-sm font-medium">Invoice Items</span>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="bg-white border border-border rounded-card p-6">
                {step === 1 ? (
                    <>
                        <h2 className="text-base font-semibold mb-5">Customer Information</h2>
                        {errors.submit && (
                            <div className="mb-4 p-3 bg-error-bg border border-error text-error text-sm rounded-lg">
                                {errors.submit}
                            </div>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <Select 
                                    label="Select Customer" 
                                    options={customerOptions} 
                                    value={formData.customerId} 
                                    onChange={(e) => {
                                        setFormData({ ...formData, customerId: e.target.value });
                                        clearFieldError('customerId');
                                    }} 
                                    placeholder="Choose a customer" 
                                    required 
                                    error={errors.customerId}
                                />
                            </div>
                            <div>
                                <Input 
                                    label="Due Date" 
                                    type="date" 
                                    value={formData.dueDate} 
                                    onChange={(e) => {
                                        setFormData({ ...formData, dueDate: e.target.value });
                                        clearFieldError('dueDate');
                                    }} 
                                    required 
                                    error={errors.dueDate}
                                />
                            </div>
                        </div>
                    </>
                ) : (
                    <>
                        <h2 className="text-base font-semibold mb-5">Invoice Items</h2>
                        {errors.submit && (
                            <div className="mb-4 p-3 bg-error-bg border border-error text-error text-sm rounded-lg">
                                {errors.submit}
                            </div>
                        )}
                        {errors.items && typeof errors.items === 'string' && (
                            <div className="mb-4 p-3 bg-error-bg border border-error text-error text-sm rounded-lg">
                                {errors.items}
                            </div>
                        )}
                        <div className="flex flex-col gap-4 mb-5">
                            {formData.items.map((item, index) => (
                                <div key={index} className="grid grid-cols-[2fr_1fr_1fr_auto] gap-3 items-start">
                                    <div>
                                        <Select 
                                            label="Item/Service" 
                                            options={itemOptions} 
                                            value={item.itemId} 
                                            onChange={(e) => handleItemChange(index, 'itemId', e.target.value)} 
                                            placeholder="Select item" 
                                            error={errors.items && errors.items[index] && errors.items[index].itemId}
                                        />
                                    </div>
                                    <div>
                                        <Input 
                                            label="Quantity" 
                                            type="number" 
                                            min="1" 
                                            value={item.quantity} 
                                            onChange={(e) => handleItemChange(index, 'quantity', e.target.value)} 
                                            error={errors.items && errors.items[index] && errors.items[index].quantity}
                                        />
                                    </div>
                                    <div>
                                        <Input 
                                            label="Price (STRK)" 
                                            type="number" 
                                            step="0.01"
                                            min="0.01"
                                            value={item.price} 
                                            onChange={(e) => handleItemChange(index, 'price', e.target.value)} 
                                            error={errors.items && errors.items[index] && errors.items[index].price}
                                        />
                                    </div>
                                    {formData.items.length > 1 && (
                                        <button 
                                            type="button" 
                                            className="p-2 text-error hover:bg-error-bg rounded-lg transition-colors mt-6" 
                                            onClick={() => handleRemoveItem(index)}
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>

                        <Button type="button" variant="secondary" icon={Plus} onClick={handleAddItem}>Add Item</Button>

                        <div className="flex items-center justify-between mt-6 pt-5 border-t border-border">
                            <span className="text-sm font-medium">Total:</span>
                            <span className="text-xl font-bold text-brand">{calculateTotal()} STRK</span>
                        </div>
                    </>
                )}

                <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-border">
                    {step === 2 && (
                        <Button 
                            variant="secondary" 
                            onClick={() => {
                                setStep(1);
                                setErrors({});
                            }}
                            disabled={isSubmitting}
                        >
                            Back
                        </Button>
                    )}
                    <Button 
                        variant="secondary" 
                        onClick={() => navigate('/invoices')}
                        disabled={isSubmitting}
                    >
                        Cancel
                    </Button>
                    <Button 
                        type="submit" 
                        variant="primary"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Processing...' : (step === 1 ? 'Next' : 'Create Invoice')}
                    </Button>
                </div>
            </form>
        </div>
    );
}

export default CreateInvoice;
