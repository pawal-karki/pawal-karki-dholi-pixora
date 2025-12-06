/*
  Warnings:

  - The values [users,tickets] on the enum `SubAccountSidebarOption_icon` will be removed. If these variants are still used in the database, this will fail.
  - The values [users,tickets] on the enum `SubAccountSidebarOption_icon` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `agencysidebaroption` MODIFY `icon` ENUM('settings', 'chart', 'calendar', 'check', 'chip', 'compass', 'database', 'flag', 'home', 'info', 'link', 'lock', 'messages', 'notification', 'payment', 'power', 'receipt', 'shield', 'star', 'tune', 'videorecorder', 'wallet', 'warning', 'headphone', 'send', 'pipelines', 'person', 'category', 'contact', 'clipboardIcon') NOT NULL DEFAULT 'info';

-- AlterTable
ALTER TABLE `subaccountsidebaroption` MODIFY `icon` ENUM('settings', 'chart', 'calendar', 'check', 'chip', 'compass', 'database', 'flag', 'home', 'info', 'link', 'lock', 'messages', 'notification', 'payment', 'power', 'receipt', 'shield', 'star', 'tune', 'videorecorder', 'wallet', 'warning', 'headphone', 'send', 'pipelines', 'person', 'category', 'contact', 'clipboardIcon') NOT NULL DEFAULT 'info';
