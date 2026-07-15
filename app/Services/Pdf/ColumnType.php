<?php
namespace App\Services\Pdf;
enum ColumnType: string {
    case Id = 'id';
    case Code = 'code';
    case Reference = 'reference';
    case Name = 'name';
    case Email = 'email';
    case Phone = 'phone';
    case Date = 'date';
    case DateTime = 'datetime';
    case Amount = 'amount';
    case Percentage = 'percentage';
    case Status = 'status';
    case Number = 'number';
    case Boolean = 'boolean';
    case ShortText = 'short_text';
    case LongText = 'long_text';
    case Default = 'default';
}
