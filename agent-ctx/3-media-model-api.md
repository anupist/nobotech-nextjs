# Task 3: Create Prisma Media Model + Media API Routes

## Work Completed

### 1. Media Model (Prisma Schema)
Added `Media` model to `/prisma/schema.prisma` with fields:
- id (cuid), filename, originalName, mimeType, size (bytes), url, alt?, width?, height?, folder (default "general"), uploadedBy?, createdAt, updatedAt

### 2. Database Sync
Ran `bun run db:push` - schema synced successfully.

### 3. Uploads Directory
Created `/public/uploads/` directory for file storage.

### 4. Media API Route (`/src/app/api/admin/media/route.ts`)
- **GET**: List media with filters (folder, search, limit, offset), paginated, sorted by createdAt desc
- **POST**: Upload files (multipart/form-data, field "files"), validates image types (jpg/jpeg/png/gif/webp/svg), max 5MB, unique filename, saves to public/uploads/, creates DB record
- **DELETE**: Delete by ID query param, removes file from disk + DB record

### 5. Media Detail Route (`/src/app/api/admin/media/[id]/route.ts`)
- **GET**: Get single media by ID
- **PUT**: Update alt text and folder
- **DELETE**: Delete by ID (same as batch delete)

### 6. Lint
`bun run lint` passes cleanly with zero errors.

## Files Modified/Created
- Modified: `/prisma/schema.prisma` (added Media model)
- Created: `/public/uploads/` (directory)
- Created: `/src/app/api/admin/media/route.ts`
- Created: `/src/app/api/admin/media/[id]/route.ts`
- Updated: `/home/z/my-project/worklog.md`
