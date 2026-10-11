Attribute VB_Name = "modDigest"
Option Explicit
' Import via VBA editor: File > Import File...
' Opens a draft Outlook email summarising the Dashboard's alerts and upcoming work.
' It only DISPLAYS the draft - review it, then press Send yourself.
' Needs desktop Outlook. For an automatic daily email use Power Automate instead.

Private Const ALERT_FIRST As Long = 43      ' Dashboard rows holding the alert counts
Private Const ALERT_LAST As Long = 59
Private Const LIST_FIRST As Long = 64       ' Dashboard rows holding the upcoming lists
Private Const LIST_LAST As Long = 78

Public Sub DraftDigestEmail()
    Dim d As Worksheet, r As Long, body As String, ol As Object, mail As Object, who As String

    Set d = ThisWorkbook.Worksheets("Dashboard")
    who = InputBox("Send the digest to (email address):", "Draft digest email")
    If Len(Trim$(who)) = 0 Then Exit Sub

    body = "Project digest - " & Format(Date, "dd mmm yyyy") & vbCrLf & vbCrLf & "ALERTS" & vbCrLf
    For r = ALERT_FIRST To ALERT_LAST
        If Val(d.Cells(r, 2).Value) > 0 Then body = body & "  - " & d.Cells(r, 1).Value & ": " & d.Cells(r, 2).Value & vbCrLf
    Next r

    body = body & vbCrLf & "UPCOMING TASKS" & vbCrLf
    For r = LIST_FIRST To LIST_LAST
        If Len(CStr(d.Cells(r, 1).Value)) > 0 Then
            body = body & "  - " & d.Cells(r, 1).Value & " (" & d.Cells(r, 2).Value & ") due " & Format(d.Cells(r, 3).Value, "dd mmm") & " [" & d.Cells(r, 4).Value & "]" & vbCrLf
        End If
    Next r

    body = body & vbCrLf & "UPCOMING ACTIONS & DECISIONS" & vbCrLf
    For r = LIST_FIRST To LIST_LAST
        If Len(CStr(d.Cells(r, 6).Value)) > 0 Then
            body = body & "  - " & d.Cells(r, 6).Value & " (" & d.Cells(r, 7).Value & ", " & d.Cells(r, 8).Value & ") due " & Format(d.Cells(r, 9).Value, "dd mmm") & " [" & d.Cells(r, 10).Value & "]" & vbCrLf
        End If
    Next r

    On Error GoTo noOutlook
    Set ol = CreateObject("Outlook.Application")
    Set mail = ol.CreateItem(0)
    mail.To = who
    mail.Subject = "Project digest - " & Format(Date, "dd mmm yyyy")
    mail.Body = body
    mail.Display
    Exit Sub
noOutlook:
    MsgBox "Could not start Outlook. Here is the digest text:" & vbCrLf & vbCrLf & body, vbExclamation
End Sub
