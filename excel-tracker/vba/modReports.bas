Attribute VB_Name = "modReports"
Option Explicit
' Import via VBA editor: File > Import File...

' One-page PDF of the Project Summary sheet for whichever project is picked in C3.
Public Sub ExportProjectSummaryPDF()
    Dim ws As Worksheet, nm As String, f As Variant
    Set ws = ThisWorkbook.Worksheets("Project Summary")
    nm = Trim$(CStr(ws.Range("C3").Value))
    If Len(nm) = 0 Then
        MsgBox "Pick a project in cell C3 of 'Project Summary' first.", vbExclamation
        Exit Sub
    End If
    f = Application.GetSaveAsFilename( _
        InitialFileName:="Project Summary - " & SafeName(nm) & " - " & Format(Date, "yyyy-mm-dd") & ".pdf", _
        FileFilter:="PDF Files (*.pdf), *.pdf")
    If VarType(f) = vbBoolean Then Exit Sub
    ws.ExportAsFixedFormat Type:=xlTypePDF, Filename:=CStr(f), Quality:=xlQualityStandard, _
        IncludeDocProperties:=True, IgnorePrintAreas:=False, OpenAfterPublish:=False
    MsgBox "Saved " & CStr(f), vbInformation
End Sub

' Dated copy of the whole workbook (choose a folder your IT department backs up).
Public Sub BackupWorkbook()
    Dim ext As String, base As String, f As Variant
    ext = Mid$(ThisWorkbook.Name, InStrRev(ThisWorkbook.Name, "."))
    base = Left$(ThisWorkbook.Name, InStrRev(ThisWorkbook.Name, ".") - 1)
    f = Application.GetSaveAsFilename(InitialFileName:=base & " backup " & Format(Now, "yyyy-mm-dd hhmm") & ext, _
        FileFilter:="Excel workbook (*" & ext & "), *" & ext)
    If VarType(f) = vbBoolean Then Exit Sub
    ThisWorkbook.SaveCopyAs CStr(f)
    MsgBox "Backup saved: " & CStr(f), vbInformation
End Sub

' Clears every register's filters so no rows are hidden.
Public Sub ShowAllRows()
    Dim ws As Worksheet
    For Each ws In ThisWorkbook.Worksheets
        If ws.FilterMode Then ws.ShowAllData
    Next ws
End Sub

Private Function SafeName(ByVal s As String) As String
    Dim bad As Variant, i As Long
    bad = Array("\", "/", ":", "*", "?", """", "<", ">", "|")
    For i = LBound(bad) To UBound(bad)
        s = Replace(s, bad(i), "-")
    Next i
    SafeName = s
End Function
