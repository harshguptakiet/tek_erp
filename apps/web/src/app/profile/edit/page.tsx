/**
 * FR-USER-002: Edit User Profile
 * Edit profile with validation and image upload
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { formResolver } from '@/lib/form';
import * as z from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '@/services/user.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import Image from 'next/image';
import { getDisplayName } from '@/lib/utils';
import type { AddressInfo } from '@/types/user.types';

const profileSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters').max(50),
  middleName: z.string().max(50).optional(),
  lastName: z.string().min(2, 'Last name must be at least 2 characters').max(50),
  dateOfBirth: z.string().optional(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY', '']).optional(),
  bloodGroup: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', '']).optional(),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
  street: z.string().max(200).optional(),
  city: z.string().max(100).optional(),
  state: z.string().max(100).optional(),
  postalCode: z.string().max(20).optional(),
  country: z.string().max(100).optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function EditProfilePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: () => userService.getProfile(),
  });

  const address = typeof profile?.address === 'object' ? profile.address : undefined;

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm<ProfileFormData>({
    resolver: formResolver(profileSchema),
    defaultValues: profile ? {
      firstName: profile.firstName || '',
      middleName: profile.middleName || '',
      lastName: profile.lastName || '',
      dateOfBirth: profile.dateOfBirth
        ? (typeof profile.dateOfBirth === 'string'
          ? profile.dateOfBirth.split('T')[0]
          : profile.dateOfBirth.toISOString().split('T')[0])
        : '',
      gender: profile.gender || '',
      bloodGroup: (profile.bloodGroup as ProfileFormData['bloodGroup']) || '',
      bio: profile.bio || '',
      street: address?.street || '',
      city: address?.city || '',
      state: address?.state || '',
      postalCode: address?.postalCode || '',
      country: address?.country || '',
    } : undefined,
  });

  const updateProfileMutation = useMutation({
    mutationFn: (data: ProfileFormData) => userService.updateProfile({
      firstName: data.firstName,
      lastName: data.lastName,
      middleName: data.middleName,
      dateOfBirth: data.dateOfBirth || undefined,
      gender: data.gender || undefined,
      bloodGroup: data.bloodGroup || undefined,
      bio: data.bio,
      address: data.street || data.city || data.state || data.postalCode || data.country
        ? {
            street: data.street || '',
            city: data.city || '',
            state: data.state || '',
            postalCode: data.postalCode || '',
            country: data.country || '',
          } satisfies AddressInfo
        : undefined,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.success('Profile updated successfully');
      setHasUnsavedChanges(false);
      router.push('/profile');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    },
  });

  const uploadImageMutation = useMutation({
    mutationFn: (file: File) => userService.uploadProfilePicture(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.success('Profile picture updated');
      setProfileImage(null);
      setPreviewUrl('');
    },
    onError: () => {
      toast.error('Failed to upload profile picture');
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image must be less than 5MB');
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        toast.error('File must be an image');
        return;
      }

      setProfileImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadImage = async () => {
    if (profileImage) {
      await uploadImageMutation.mutateAsync(profileImage);
    }
  };

  const onSubmit = async (data: ProfileFormData) => {
    await updateProfileMutation.mutateAsync(data);
  };

  const handleCancel = () => {
    if (isDirty || hasUnsavedChanges) {
      const confirm = window.confirm('You have unsaved changes. Are you sure you want to leave?');
      if (confirm) {
        router.push('/profile');
      }
    } else {
      router.push('/profile');
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Edit Profile</h1>
        <p className="mt-2 text-sm text-gray-600">
          Update your personal information and settings
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Profile Picture */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Picture</CardTitle>
            <CardDescription>Upload a new profile picture (max 5MB)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-6">
              {/* Current/Preview Image */}
              <div className="relative w-32 h-32 rounded-full overflow-hidden bg-gray-200">
                {previewUrl ? (
                  <Image src={previewUrl} alt="Preview" fill className="object-cover" />
                ) : profile?.profilePicture ? (
                  <Image src={profile.profilePicture} alt={getDisplayName(profile)} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-indigo-100 text-indigo-600 text-4xl font-bold">
                    {profile?.firstName?.[0]}{profile?.lastName?.[0]}
                  </div>
                )}
              </div>

              {/* Upload Controls */}
              <div className="flex-1">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  id="profile-image"
                />
                <label
                  htmlFor="profile-image"
                  className="inline-flex h-10 cursor-pointer items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
                >
                  Choose Image
                </label>
                {profileImage && (
                  <div className="mt-3 flex items-center gap-3">
                    <p className="text-sm text-gray-600">{profileImage.name}</p>
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleUploadImage}
                      disabled={uploadImageMutation.isPending}
                    >
                      {uploadImageMutation.isPending ? 'Uploading...' : 'Upload'}
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setProfileImage(null);
                        setPreviewUrl('');
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                  First Name *
                </label>
                <Input
                  id="firstName"
                  {...register('firstName')}
                  error={errors.firstName?.message}
                />
              </div>
              <div>
                <label htmlFor="middleName" className="block text-sm font-medium text-gray-700 mb-1">
                  Middle Name
                </label>
                <Input
                  id="middleName"
                  {...register('middleName')}
                  error={errors.middleName?.message}
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name *
                </label>
                <Input
                  id="lastName"
                  {...register('lastName')}
                  error={errors.lastName?.message}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 mb-1">
                  Date of Birth
                </label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  {...register('dateOfBirth')}
                  error={errors.dateOfBirth?.message}
                />
              </div>
              <div>
                <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
                  Gender
                </label>
                <Select id="gender" {...register('gender')} error={errors.gender?.message}>
                  <option value="">Select gender</option>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </Select>
              </div>
              <div>
                <label htmlFor="bloodGroup" className="block text-sm font-medium text-gray-700 mb-1">
                  Blood Group
                </label>
                <Select id="bloodGroup" {...register('bloodGroup')} error={errors.bloodGroup?.message}>
                  <option value="">Select blood group</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </Select>
              </div>
            </div>

            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
                Bio
              </label>
              <Textarea
                id="bio"
                rows={4}
                placeholder="Tell us about yourself..."
                {...register('bio')}
                error={errors.bio?.message}
              />
              <p className="mt-1 text-sm text-gray-500">
                Maximum 500 characters
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Address */}
        <Card>
          <CardHeader>
            <CardTitle>Address</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label htmlFor="street" className="block text-sm font-medium text-gray-700 mb-1">
                Street Address
              </label>
              <Input
                id="street"
                placeholder="123 Main Street"
                {...register('street')}
                error={errors.street?.message}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                  City
                </label>
                <Input
                  id="city"
                  placeholder="Mumbai"
                  {...register('city')}
                  error={errors.city?.message}
                />
              </div>
              <div>
                <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                  State/Province
                </label>
                <Input
                  id="state"
                  placeholder="Maharashtra"
                  {...register('state')}
                  error={errors.state?.message}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-1">
                  Postal Code
                </label>
                <Input
                  id="postalCode"
                  placeholder="400001"
                  {...register('postalCode')}
                  error={errors.postalCode?.message}
                />
              </div>
              <div>
                <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                  Country
                </label>
                <Input
                  id="country"
                  placeholder="India"
                  {...register('country')}
                  error={errors.country?.message}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Form Actions */}
        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={updateProfileMutation.isPending || !isDirty}
          >
            {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </div>
  );
}
