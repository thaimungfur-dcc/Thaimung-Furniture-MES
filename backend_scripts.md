# Google Apps Script Backend

This file contains the standard scripts for both the **Master Registry** and the **Client Database**.

## 1. Master Registry Script (`MasterRegistry.gs`)
Deploy this on a central Google Sheet to manage all clients.

```javascript
function doPost(e) {
  try {
    var request = JSON.parse(e.postData.contents);
    var action = request.action;
    var sheetName = request.sheet || "Registry";
    var data = request.data;
    
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(sheetName);
    
    if (action === "read") {
      var licenseKey = data.licenseKey;
      var rows = sheet.getDataRange().getValues();
      var headers = rows[0];
      
      for (var i = 1; i < rows.length; i++) {
        var row = rows[i];
        if (row[0] === licenseKey && row[3] === true) { // LicenseKey, ClientName, ApiUrl, IsActive
          return createResponse("success", "Client found", {
            clientName: row[1],
            apiUrl: row[2]
          });
        }
      }
      return createResponse("error", "Invalid or inactive License Key");
    }
    
    return createResponse("error", "Invalid action");
  } catch (err) {
    return createResponse("error", err.toString());
  }
}

function createResponse(status, message, data) {
  var result = { status: status, message: message, data: data };
  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}
```

## 2. Client Database Script (`Code.gs`)
Deploy this on each client's individual Google Sheet.

```javascript
function doPost(e) {
  try {
    var request = JSON.parse(e.postData.contents);
    var action = request.action;
    var sheetName = request.sheet;
    var data = request.data;
    
    // Auto-Provisioning: Create sheets if they don't exist
    initSheets();
    
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(sheetName);
    
    if (action === "login") {
      return handleLogin(data.employeeId, data.idCard);
    }
    
    if (action === "read") {
      return handleRead(sheet);
    }
    
    // Add more actions: write, update, delete...
    
    return createResponse("error", "Action not implemented");
  } catch (err) {
    return createResponse("error", err.toString());
  }
}

function handleLogin(empId, idCard) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Users");
  var rows = sheet.getDataRange().getValues();
  var headers = rows[0];
  
  for (var i = 1; i < rows.length; i++) {
    var row = rows[i];
    // Assuming columns: EmployeeID, Name, IDCard, Role, Permissions (JSON)
    if (row[0] == empId && row[2] == idCard) {
      logAccess(empId, row[1]);
      return createResponse("success", "Login successful", {
        employeeId: row[0],
        name: row[1],
        role: row[3],
        permissions: JSON.parse(row[4] || "[]")
      });
    }
  }
  return createResponse("error", "Invalid Employee ID or Password");
}

function logAccess(id, name) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("AccessLog");
  sheet.appendRow([new Date(), id, name]);
}

function initSheets() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // Users Sheet
  if (!ss.getSheetByName("Users")) {
    var userSheet = ss.insertSheet("Users");
    userSheet.appendRow(["EmployeeID", "Name", "IDCard", "Role", "Permissions"]);
    userSheet.appendRow(["admin", "System Admin", "1234567890123", "admin", '["all"]']);
  }
  
  // AccessLog Sheet
  if (!ss.getSheetByName("AccessLog")) {
    var logSheet = ss.insertSheet("AccessLog");
    logSheet.appendRow(["Timestamp", "EmployeeID", "Name"]);
  }
  
  // Data Sheet
  if (!ss.getSheetByName("Data")) {
    var dataSheet = ss.insertSheet("Data");
    dataSheet.appendRow(["ID", "Content", "CreatedBy", "CreatedAt"]);
  }
}

function createResponse(status, message, data) {
  var result = { status: status, message: message, data: data };
  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}
```
