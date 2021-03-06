# Migration `20200923020122-init`

This migration has been generated by Erin Dachtler at 9/22/2020, 7:01:22 PM.
You can check out the [state of the schema](./schema.prisma) after the migration.

## Database Steps

```sql
CREATE TABLE "BrowserHandle" (
    "id" TEXT NOT NULL,
    "subscription" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
PRIMARY KEY ("id")
)

CREATE TABLE "Channel" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "handleId" TEXT NOT NULL,

    FOREIGN KEY ("handleId") REFERENCES "BrowserHandle"("id") ON DELETE CASCADE ON UPDATE CASCADE,
PRIMARY KEY ("id")
)
```

## Changes

```diff
diff --git schema.prisma schema.prisma
migration ..20200923020122-init
--- datamodel.dml
+++ datamodel.dml
@@ -1,0 +1,24 @@
+generator client {
+  provider = "prisma-client-js"
+}
+
+datasource db {
+  provider = "sqlite"
+  url = "***"
+}
+
+model BrowserHandle {
+  id            String         @id @default(uuid())
+  subscription  String
+  enabled       Boolean        @default(true)
+
+  channels      Channel[]
+}
+
+model Channel {
+  id            String         @id @default(cuid())
+  label         String
+
+  handleId      String
+  handle        BrowserHandle  @relation(fields: [handleId], references: [id])
+}
```


